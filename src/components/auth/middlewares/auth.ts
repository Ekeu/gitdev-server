import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GITDEV_ERRORS } from "../constants";
import passport from "passport";
import { IUserDocument } from "@components/user/interfaces";
import { IAuthUserDocument } from "../interfaces";
import { accessTokenCookieConfig } from "@config/cookie";
import { ApiError } from "@utils/errors/api-error";

export class AuthMiddleware {
  static async isAuthtenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[accessTokenCookieConfig.cookie.name];

    if (!token) {
      return next(
        new ApiError(
          GITDEV_ERRORS.UNAUTHENTICATED.name,
          StatusCodes.UNAUTHORIZED,
          GITDEV_ERRORS.UNAUTHENTICATED.message,
        ),
      );
    }

    passport.authenticate("jwt", { session: false }, (err: Error, user: IUserDocument) => {
      if (err || !user) {
        return next(
          new ApiError(
            GITDEV_ERRORS.UNAUTHENTICATED.name,
            StatusCodes.UNAUTHORIZED,
            GITDEV_ERRORS.UNAUTHENTICATED.message,
          ),
        );
      }

      req.currentUser = {
        token,
        userId: user._id.toString(),
        email: (user.authUser as IAuthUserDocument).email,
        redisId: (user.authUser as IAuthUserDocument).redisId,
        username: (user.authUser as IAuthUserDocument).username,
        isVerified: (user.authUser as IAuthUserDocument).emailVerified,
        authUser: (user.authUser as IAuthUserDocument)._id.toString(),
      };

      next();
    })(req, res, next);
  }
}
