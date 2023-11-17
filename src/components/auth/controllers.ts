import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import gravatar from "gravatar";
import passport from "passport";
import jwt from "jsonwebtoken";
import _ from "lodash";
import crypto from "crypto";

import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { signupSchema } from "./data/joi-schemes/signup";
import { AuthUserServices } from "./services";
import { GITDEV_AUTH_SIGNUP_JOB, GITDEV_ERRORS, GITDEV_SIGNIN_SUCCESSFUL, GITDEV_SIGNUP_SUCCESSFUL } from "./constants";
import { generateRandomNumericUUID } from "@utils/common";
import { userCache } from "@components/user/redis/cache/user";
import { authMQ } from "./bullmq/auth-mq";
import { initAuthUserDocument, initUserDocument } from "./utils/common";
import { IUserDocument } from "@components/user/interfaces";
import { userMQ } from "@components/user/bullmq/user-mq";
import { GITDEV_USER_SIGNUP_JOB } from "@components/user/constants";
import { signinSchema } from "./data/joi-schemes/signin";
import { IAuthUserDocument, IAuthUserTokenDocument, IJWTPayload } from "./interfaces";
import { logger } from "@config/logger";
import { AuthToken } from "./data/models/auth-token";
import { accessTokenCookieConfig, refreshTokenCookieConfig } from "@config/cookie";
import { ApiError } from "@utils/errors/api-error";
import { env } from "@/env";

export class AuthUserControllers {
  @joiRequestValidator(signupSchema)
  static async signUp(req: Request, res: Response) {
    const { email, password, username } = req.body;

    const avatar = gravatar.url(email, { d: "retro" }, true);
    const redisId = generateRandomNumericUUID();

    const authDoc = initAuthUserDocument({ email, password, username, redisId });
    const userDoc = initUserDocument(authDoc._id, avatar);

    await userCache.save("users", `${userDoc._id}`, redisId, userDoc as IUserDocument);
    await userCache.save("authusers", `${authDoc._id}`, redisId, _.omit(authDoc, ["password"]) as IAuthUserDocument);

    authMQ.addJob(GITDEV_AUTH_SIGNUP_JOB, { value: authDoc });
    userMQ.addJob(GITDEV_USER_SIGNUP_JOB, { value: userDoc });

    res.status(StatusCodes.CREATED).json({
      user: _.omit(authDoc, ["password"]),
      message: GITDEV_SIGNUP_SUCCESSFUL,
    });
  }

  @joiRequestValidator(signinSchema)
  static async signIn(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (error: Error, user: IUserDocument, info: { message?: string }) => {
      const hackedRefreshToken = req.cookies[refreshTokenCookieConfig.cookie.name];
      if (error || !user) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          message: info?.message || GITDEV_ERRORS.SIGNIN_FAILED.message,
        });
      }

      req.login(user, { session: false }, async (error: Error) => {
        if (error) {
          logger.error(`[SignIn Error]: ${error.message}`, error);
          return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            message: GITDEV_ERRORS.SIGNIN_ERROR.message,
          });
        }

        const jwtPayload = {
          role: (user.authUser as IAuthUserDocument).role,
          email: (user.authUser as IAuthUserDocument).email,
          redisId: (user.authUser as IAuthUserDocument).redisId,
          username: (user.authUser as IAuthUserDocument).username,
          authUser: (user.authUser as IAuthUserDocument)._id.toString(),
          userId: user._id.toString(),
        };

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
          message: GITDEV_SIGNIN_SUCCESSFUL,
        });
      });
    })(req, res, next);
  }

  static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    let authUserRefreshToken: IAuthUserTokenDocument | null = null;

    const cookies = req.cookies;
    const refreshToken = cookies[refreshTokenCookieConfig.cookie.name];

    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ name: GITDEV_ERRORS.UNAUTHENTICATED.name, message: GITDEV_ERRORS.UNAUTHENTICATED.message });
    }

    try {
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

    const refreshTokenHash = crypto.createHmac("sha256", env.GITDEV_JWT_SECRET).update(refreshToken).digest("hex");

    if (authUserToken) {
      authUserToken.refreshTokens = authUserToken.refreshTokens.filter((rfTkn) => rfTkn.token !== refreshTokenHash);
      await authUserToken.save();
    }

    res.clearCookie(refreshTokenCookieConfig.cookie.name, refreshTokenCookieConfig.cookie.options);
    res.clearCookie(accessTokenCookieConfig.cookie.name, accessTokenCookieConfig.cookie.options);
    res.status(StatusCodes.NO_CONTENT).end();
  }
}
