import { Request, Response } from "express";
import { IUserDocument } from "./interfaces";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { userCache } from "./redis/cache/user";
import { UserServices } from "./services";
import { StatusCodes } from "http-status-codes";

export class UserControllers {
  static async fetchUserProfile(req: Request, res: Response) {
    let user: IUserDocument | null = null;
    const cachedAuthUser: IAuthUserDocument | null = (await userCache.get(
      "authusers",
      `${req.currentUser?.authUser}`,
    )) as IAuthUserDocument | null;
    const cachedUser: IUserDocument | null = (await userCache.get(
      "users",
      `${req.currentUser?.userId}`,
    )) as IUserDocument | null;

    if (cachedAuthUser && cachedUser) {
      user = {
        ...cachedUser,
        authUser: cachedAuthUser,
      } as IUserDocument;
    } else {
      user = await UserServices.findUserById(req.currentUser?.userId as string);
    }
    res.status(StatusCodes.OK).json({
      message: "User profile fetched successfully",
      user,
    });
  }
}
