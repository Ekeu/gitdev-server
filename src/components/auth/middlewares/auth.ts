import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GITDEV_ERRORS } from "../constants";
import passport from "passport";
import { IUserDocument } from "@components/user/interfaces";
import { IAuthUserDocument } from "../interfaces";
import { accessTokenCookieConfig } from "@config/cookie";

export class AuthMiddleware {
  static async isAuthtenticated(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[accessTokenCookieConfig.cookie.name];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        name: GITDEV_ERRORS.UNAUTHENTICATED.name,
        message: GITDEV_ERRORS.UNAUTHENTICATED.message,
      });
    }

    passport.authenticate("jwt", { session: false }, (err: Error, user: IUserDocument) => {
      if (err || !user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          name: GITDEV_ERRORS.JWT_FAILED_OR_USER_NOT_FOUND.name,
          message: GITDEV_ERRORS.JWT_FAILED_OR_USER_NOT_FOUND.message,
        });
      }

      req.currentUser = {
        authUser: (user.authUser as IAuthUserDocument)._id.toString(),
        userId: user._id.toString(),
        token,
      };

      next();
    })(req, res, next);
  }
}
