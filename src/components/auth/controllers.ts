import { NextFunction, Request, Response } from "express";
import path from "path";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import reqIP from "request-ip";
import parser from "ua-parser-js";
import { DateTime } from "luxon";
import geoip from "geoip-lite";
import speakeasy from "speakeasy";

import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { signupSchema } from "./data/joi-schemes/signup";
import { AuthUserServices } from "./services";
import { GITDEV_ERRORS, GITDEV_SIGNIN_SUCCESSFUL, GITDEV_SIGNUP_SUCCESSFUL } from "./constants";
import { generateJwtPayload, initAndSave } from "./utils/common";
import { IUserDocument } from "@components/user/interfaces";
import { signinSchema } from "./data/joi-schemes/signin";
import { IAuthUserDocument, IAuthUserTokenDocument, IJWTPayload } from "./interfaces";
import { logger } from "@config/logger";
import { AuthToken } from "./data/models/auth-token";
import { accessTokenCookieConfig, refreshTokenCookieConfig } from "@config/cookie";
import { ApiError } from "@utils/errors/api-error";
import { env } from "@/env";
import { MailServices } from "@components/mail/services";
import { emailForgotMQ } from "@components/mail/bullmq/mail-mq";
import {
  GITDEV_EMAIL_FORGOT_PASSWORD_JOB,
  GITDEV_EMAIL_RESET_PASSWORD_JOB,
  GITDEV_EMAIL_VERIFY_ACCOUNT_JOB,
} from "@components/mail/constants";
import { emailSchema, passwordSchema, resetTokenSchema } from "./data/joi-schemes/reset";
import { emailVerificationTokenSchema } from "./data/joi-schemes/verify";

export class AuthUserControllers {
  @joiRequestValidator(signupSchema)
  static async signUp(req: Request, res: Response) {
    await initAndSave(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: GITDEV_SIGNUP_SUCCESSFUL,
    });
  }

  @joiRequestValidator(signinSchema)
  static async signIn(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (error: Error, user: IUserDocument, info: { message?: string }) => {
      const hackedRefreshToken = req.cookies[refreshTokenCookieConfig.cookie.name];
      if (error || !user) {
        return next(
          new ApiError(
            GITDEV_ERRORS.SIGNIN_FAILED.name,
            StatusCodes.UNPROCESSABLE_ENTITY,
            error?.message || info?.message || GITDEV_ERRORS.SIGNIN_FAILED.message,
          ),
        );
      }

      req.login(user, { session: false }, async (error: Error) => {
        if (error) {
          logger.error(`[SignIn Error]: ${error.message}`, error);
          return next(
            new ApiError(
              GITDEV_ERRORS.SIGNIN_FAILED.name,
              StatusCodes.UNPROCESSABLE_ENTITY,
              error?.message || info?.message || GITDEV_ERRORS.SIGNIN_FAILED.message,
            ),
          );
        }

        const jwtPayload = generateJwtPayload(user);

        const accessToken = AuthToken.generateAccessToken(jwtPayload);

        if (hackedRefreshToken) {
          const authUserToken = await AuthToken.findOne({ "refreshTokens.token": hackedRefreshToken });

          if (authUserToken) {
            await AuthToken.updateOne(
              {
                authUser: (user.authUser as IAuthUserDocument)._id,
              },
              {
                $pull: {
                  refreshTokens: {
                    token: hackedRefreshToken,
                  },
                },
              },
            );
          }

          res.clearCookie(refreshTokenCookieConfig.cookie.name, refreshTokenCookieConfig.cookie.options);
        }

        const refreshToken = await AuthToken.generateRefreshToken(jwtPayload, (user.authUser as IAuthUserDocument)._id);
        res.cookie(refreshTokenCookieConfig.cookie.name, refreshToken, refreshTokenCookieConfig.cookie.options);
        res.cookie(accessTokenCookieConfig.cookie.name, accessToken, accessTokenCookieConfig.cookie.options);

        res.status(StatusCodes.OK).json({
          user,
          success: true,
          message: GITDEV_SIGNIN_SUCCESSFUL,
        });
      });
    })(req, res, next);
  }

  static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    let authUserRefreshToken: IAuthUserTokenDocument | null = null;

    const cookies = req.cookies;
    const refreshToken = cookies[refreshTokenCookieConfig.cookie.name];

    try {
      if (!refreshToken) {
        throw new ApiError(
          GITDEV_ERRORS.UNAUTHENTICATED.name,
          StatusCodes.UNAUTHORIZED,
          GITDEV_ERRORS.UNAUTHENTICATED.message,
        );
      }

      res.clearCookie(refreshTokenCookieConfig.cookie.name, refreshTokenCookieConfig.cookie.options);

      const decodedRefreshToken = jwt.verify(refreshToken, env.GITDEV_JWT_SECRET) as IJWTPayload;
      const refreshTokenHash = crypto.createHmac("sha256", env.GITDEV_JWT_SECRET).update(refreshToken).digest("hex");

      authUserRefreshToken = await AuthToken.findOne({ "refreshTokens.token": refreshTokenHash });

      if (!authUserRefreshToken) {
        const hackedAuthUser = await AuthUserServices.findByUsernameOrEmail(
          decodedRefreshToken.username,
          decodedRefreshToken.email,
        );

        if (hackedAuthUser) {
          const hackedAuthUserTokens = await AuthToken.findOne({ authUser: hackedAuthUser._id });

          if (hackedAuthUserTokens) {
            hackedAuthUserTokens.refreshTokens = [];
            await hackedAuthUserTokens.save();
          }
        }

        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ name: GITDEV_ERRORS.UNAUTHENTICATED.name, message: GITDEV_ERRORS.UNAUTHENTICATED.message });
      }

      await AuthToken.updateOne(
        { authUser: decodedRefreshToken.authUser },
        { $pull: { refreshTokens: { token: refreshTokenHash } } },
      );
      const newAccessToken = AuthToken.generateAccessToken(decodedRefreshToken);
      const newRefreshToken = await AuthToken.generateRefreshToken(decodedRefreshToken, authUserRefreshToken.authUser);

      res.cookie(refreshTokenCookieConfig.cookie.name, newRefreshToken, refreshTokenCookieConfig.cookie.options);

      res.status(StatusCodes.CREATED);
      res.set({
        "Cache-Control": "no-store",
      });

      res.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      const err = error as Error;

      if (err.name === "TokenExpiredError") {
        if (authUserRefreshToken) {
          await AuthToken.updateOne(
            { authUser: authUserRefreshToken.authUser },
            { $pull: { refreshTokens: { token: refreshToken } } },
          );
        }
      }
      if (err.name === "JsonWebTokenError") {
        return next(new ApiError(err.name, StatusCodes.FORBIDDEN, err.message));
      }
      next(error);
    }
  }

  static async signOut(req: Request, res: Response) {
    const { authUser } = req.body;

    const authUserToken = await AuthToken.findOne({ authUser });

    const cookies = req.cookies;

    const refreshToken = cookies[refreshTokenCookieConfig.cookie.name];

    if (!refreshToken) {
      return res.status(StatusCodes.NO_CONTENT).end();
    }

    const refreshTokenHash = crypto
      .createHmac("sha256", env.GITDEV_REFRESH_JWT_SECRET)
      .update(refreshToken)
      .digest("hex");

    if (authUserToken) {
      authUserToken.refreshTokens = authUserToken.refreshTokens.filter((rfTkn) => rfTkn.token !== refreshTokenHash);
      await authUserToken.save();
    }
    res.clearCookie(refreshTokenCookieConfig.cookie.name, refreshTokenCookieConfig.cookie.options);
    res.clearCookie(accessTokenCookieConfig.cookie.name, accessTokenCookieConfig.cookie.options);
    res.status(StatusCodes.NO_CONTENT).end();
  }

  static socialAuth(provider: string, scope: string[]) {
    return function (req: Request, res: Response, next: NextFunction) {
      passport.authenticate(provider, { scope, session: false })(req, res, next);
    };
  }

  static socialAuthCallback(provider: string) {
    return async function (req: Request, res: Response, next: NextFunction) {
      passport.authenticate(provider, (error: Error, user: IUserDocument) => {
        if (error || !user) {
          throw new ApiError(
            GITDEV_ERRORS.SOCIAL_SIGNIN_FAILED.name,
            StatusCodes.UNPROCESSABLE_ENTITY,
            error?.message || GITDEV_ERRORS.SOCIAL_SIGNIN_FAILED.message,
          );
        }

        req.login(user, { session: false }, async (error: Error) => {
          if (error) {
            logger.error(`[Social SignIn Error]: ${error.message}`, error);
            throw new ApiError(
              GITDEV_ERRORS.SOCIAL_SIGNIN_FAILED.name,
              StatusCodes.UNPROCESSABLE_ENTITY,
              error?.message || GITDEV_ERRORS.SOCIAL_SIGNIN_FAILED.message,
            );
          }

          const jwtPayload = generateJwtPayload(user);

          const accessToken = AuthToken.generateAccessToken(jwtPayload);

          const refreshToken = await AuthToken.generateRefreshToken(
            jwtPayload,
            (user.authUser as IAuthUserDocument)._id,
          );
          res.cookie(refreshTokenCookieConfig.cookie.name, refreshToken, refreshTokenCookieConfig.cookie.options);
          res.cookie(accessTokenCookieConfig.cookie.name, accessToken, accessTokenCookieConfig.cookie.options);

          res.status(StatusCodes.OK).json({
            user,
            success: true,
            message: GITDEV_SIGNIN_SUCCESSFUL,
          });
        });
      })(req, res, next);
    };
  }

  @joiRequestValidator(emailSchema)
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const resMessage = `We've sent and email to ${email} with instructions to reset your password.`;
      const authUser = await AuthUserServices.findUserByEmail(email);
      if (!authUser) {
        /**
         * If email is not found, we throw an exception with a 200 status code
         * It's a security measure to prevent attackers from knowing if an email exists in the database
         * And to avoid user enumeration attacks, we don't want to give attackers any clues
         */
        throw new ApiError("ResetLink", StatusCodes.OK, resMessage);
      }
      const resetToken = await AuthToken.generateResetPasswordToken(authUser._id);
      const encodedToken = encodeURIComponent(resetToken);
      const resetLink = `${env.GITDEV_CLIENT_URL}/reset-password/${encodedToken}`;

      try {
        const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "forgot.ejs");
        const ejsTemplate = await MailServices.getEJSTemplate(ejsFile, { resetLink, username: authUser.username });
        emailForgotMQ.addJob(GITDEV_EMAIL_FORGOT_PASSWORD_JOB, {
          value: {
            to: email,
            subject: "[GitDev] Please reset your password",
            html: ejsTemplate,
          },
        });
        res.status(StatusCodes.OK).json({ success: true, message: resMessage });
      } catch (error) {
        await AuthToken.updateOne(
          { authUser: authUser._id },
          {
            $unset: { resetPasswordToken: 1, resetPasswordTokenExpires: 1 },
          },
        );
        throw new ApiError(
          GITDEV_ERRORS.FORGOT_PASSWORD.name,
          StatusCodes.INTERNAL_SERVER_ERROR,
          (error as Error)?.message || GITDEV_ERRORS.FORGOT_PASSWORD.message,
        );
      }
    } catch (error) {
      next(error);
    }
  }

  @joiRequestValidator(passwordSchema)
  @joiRequestValidator(resetTokenSchema, { body: false, params: true })
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken } = req.params;
      const { password } = req.body;
      const [token, tokenSecret] = decodeURIComponent(resetToken).split("+");

      const resetTokenHash = crypto.createHmac("sha256", tokenSecret).update(token).digest("hex");

      const authUserToken = await AuthToken.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordTokenExpiresAt: { $gt: Date.now() },
      });

      if (!authUserToken) {
        throw new ApiError(
          GITDEV_ERRORS.RESET_PASSWORD_TOKEN_INVALID.name,
          StatusCodes.BAD_REQUEST,
          GITDEV_ERRORS.RESET_PASSWORD_TOKEN_INVALID.message,
        );
      }

      const authUser = await AuthUserServices.findAuthUserById(authUserToken.authUser);

      if (!authUser) {
        throw new ApiError(
          GITDEV_ERRORS.RESET_PASSWORD_TOKEN_INVALID.name,
          StatusCodes.BAD_REQUEST,
          GITDEV_ERRORS.RESET_PASSWORD_TOKEN_INVALID.message,
        );
      }

      authUser.password = password;

      await authUser.save();
      await AuthToken.updateOne(
        { authUser: authUser._id },
        { $unset: { resetPasswordToken: 1, resetPasswordTokenExpires: 1 } },
      );

      const clientIp = reqIP.getClientIp(req);
      const ua = parser(req.headers["user-agent"]);
      const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "reset.ejs");
      const ejsTemplate = await MailServices.getEJSTemplate(ejsFile, {
        username: authUser.username,
        date: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
        ip: clientIp,
        location: clientIp ? `${geoip.lookup(clientIp)?.city} | ${geoip.lookup(clientIp)}` : "Unknown",
        device: `${ua.browser.name} on ${ua.os.name}`,
      });
      emailForgotMQ.addJob(GITDEV_EMAIL_RESET_PASSWORD_JOB, {
        value: {
          to: authUser.email,
          subject: "[GitDev] Your password was reset",
          html: ejsTemplate,
        },
      });
      res.status(StatusCodes.OK).json({ success: true, message: "Your password was reset successfully." });
    } catch (error) {
      next(error);
    }
  }

  static async sendEmailVerificationToken(req: Request, res: Response) {
    const emailSecret = speakeasy.generateSecret({ length: 20 }).base32;
    await AuthToken.updateOne({ authUser: req.currentUser!.authUser }, { emailSecret });
    const emailVerificationToken = speakeasy.totp({
      secret: emailSecret,
      encoding: "base32",
      step: env.GITDEV_EMAIL_VERIFICATION_SPEAKEASY_STEPS,
    });
    const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "verify.ejs");
    const ejsTemplate = await MailServices.getEJSTemplate(ejsFile, {
      username: req.currentUser!.username!,
      token: emailVerificationToken,
    });
    emailForgotMQ.addJob(GITDEV_EMAIL_VERIFY_ACCOUNT_JOB, {
      value: {
        to: req.currentUser!.email!,
        subject: "[GitDev] Let the journey begin! 🚀",
        html: ejsTemplate,
      },
    });
    res.status(StatusCodes.OK).json({ success: true, message: "Email verification token sent successfully." });
  }

  @joiRequestValidator(emailVerificationTokenSchema)
  static async verifyEmailToken(req: Request, res: Response) {
    const { emailToken } = req.body;

    if (req.currentUser!.isVerified) {
      return res.status(StatusCodes.OK).json({ success: true, message: "Email already verified." });
    }

    const authUserToken = await AuthToken.findOne({ authUser: req.currentUser!.authUser });

    const verified = speakeasy.totp.verify({
      secret: authUserToken!.emailSecret,
      encoding: "base32",
      token: emailToken,
      step: env.GITDEV_EMAIL_VERIFICATION_SPEAKEASY_STEPS,
    });

    if (!verified) {
      throw new ApiError(
        GITDEV_ERRORS.EMAIL_VERIFICATION_TOKEN_INVALID.name,
        StatusCodes.BAD_REQUEST,
        GITDEV_ERRORS.EMAIL_VERIFICATION_TOKEN_INVALID.message,
      );
    }

    await AuthUserServices.updateEmailVerified(req.currentUser!.authUser);
    await AuthToken.updateOne({ authUser: req.currentUser!.authUser }, { $unset: { emailSecret: 1 } });
    res.status(StatusCodes.OK).json({ success: true, message: "Email verified successfully." });
  }
}
