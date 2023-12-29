import { Request, Response } from "express";
import { IUserDocument, TUserBlockAction } from "./interfaces";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { userCache } from "./redis/cache/user";
import { UserServices } from "./services";
import { StatusCodes } from "http-status-codes";
import { updateUserBlockListMQ } from "./bullmq/user-mq";
import { GITDEV_USER_BLOCK_LIST_JOB } from "./constants";
import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { updateUserBlockListSchema } from "./data/joi-schemes/user";

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

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    res.status(StatusCodes.OK).json({
      message: "User profile fetched successfully",
      success: true,
      data: user,
    });
  }

  @joiRequestValidator(updateUserBlockListSchema, { body: false, params: true })
  static async updateUserBlockList(req: Request, res: Response) {
    const { blockedUserId, action } = req.params;

    await userCache.updateUserBlockList(req.currentUser?.userId as string, blockedUserId, action as TUserBlockAction);

    updateUserBlockListMQ.addJob(GITDEV_USER_BLOCK_LIST_JOB, {
      userId: req.currentUser?.userId as string,
      blockedUserId,
      action: action as TUserBlockAction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `User ${action}ed successfully`,
    });
  }
}
