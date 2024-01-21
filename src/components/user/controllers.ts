import { Request, Response } from "express";
import { INotification, IUserBasicInfo, IUserDocument, TUserBlockAction } from "./interfaces";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { userCache } from "./redis/cache/user";
import { UserServices } from "./services";
import { StatusCodes } from "http-status-codes";
import gravatar from "gravatar";
import {
  updateNotificationSettingsMQ,
  updateUserAvatarMQ,
  updateUserBasicInfoMQ,
  updateUserBlockListMQ,
} from "./bullmq/user-mq";
import {
  GITDEV_USER_AVATAR_JOB,
  GITDEV_USER_BASIC_INFO_UPDATE_JOB,
  GITDEV_USER_BLOCK_LIST_JOB,
  GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_JOB,
} from "./constants";
import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { basicInfoUpdateSchema, notificationSettingsSchema, updateUserBlockListSchema } from "./data/joi-schemes/user";
import { uploadImage } from "@helpers/cloudinary";
import { IOUser } from "./socket";
import { UploadApiResponse } from "cloudinary";
import { ApiError } from "@utils/errors/api-error";
import { PostServices } from "@components/post/services";
import { Types } from "mongoose";
import { IPostDocument } from "@components/post/interfaces";
import { postCache } from "@components/post/redis/cache/post";

export class UserControllers {
  static async fetchUserProfile(req: Request, res: Response) {
    const { me } = req.params;

    const userId = me || (req.currentUser?.userId as string);

    let user: IUserDocument | null = null;
    const cachedAuthUser: IAuthUserDocument | null = (await userCache.get(
      "authusers",
      userId,
    )) as IAuthUserDocument | null;
    const cachedUser: IUserDocument | null = (await userCache.get("users", userId)) as IUserDocument | null;

    if (cachedAuthUser && cachedUser) {
      user = {
        ...cachedUser,
        authUser: cachedAuthUser,
      } as IUserDocument;
    } else {
      user = await UserServices.findUserById(userId);
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

  static async updateUserAvatar(req: Request, res: Response) {
    const { img } = req.body;

    let response: string | UploadApiResponse = "";

    if (img) {
      response = await uploadImage(img, {
        folder: "avatars",
        public_id: req.currentUser?.userId,
        invalidate: true,
        overwrite: true,
      });
    } else {
      response = gravatar.url(req.currentUser?.email as string, { d: "retro" }, true);
    }

    if (img && !(response as UploadApiResponse).public_id) {
      throw new ApiError("ImageUploadError", StatusCodes.BAD_REQUEST);
    }

    const avatar = img ? (response as UploadApiResponse).secure_url : (response as string);

    await userCache.updateField(req.currentUser?.userId as string, "avatar", avatar);

    IOUser.io.emit("avatar", {
      userId: req.currentUser?.userId,
      avatar,
    });

    updateUserAvatarMQ.addJob(GITDEV_USER_AVATAR_JOB, {
      userId: req.currentUser?.userId as string,
      avatar,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        avatar,
      },
    });
  }

  static async fetchUserPosts(req: Request, res: Response) {
    const { me, redisId, page } = req.params;

    const skip = (parseInt(page) - 1) * 5;
    const limit = 5 * parseInt(page);

    const userId = me || (req.currentUser?.userId as string);
    const _redisId = parseInt(redisId);

    let posts: IPostDocument[] = [];

    const cachedPosts = await postCache.getAll(
      { start: _redisId, end: _redisId },
      { BY: "SCORE", LIMIT: { offset: skip, count: limit } },
    );

    if (cachedPosts.length) {
      posts = cachedPosts;

      for (let index = 0; index < posts.length; index++) {
        const user = await UserServices.getAuthLookUpData(
          posts[index].user.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        posts[index].user = user as IUserDocument;
      }
    } else {
      posts = await PostServices.getPosts({ _id: new Types.ObjectId(userId) }, skip, limit);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User posts fetched successfully",
      data: {
        posts,
      },
    });
  }

  static async fetchUserSuggestions(req: Request, res: Response) {
    const { limit } = req.query;

    const suggestions = await UserServices.getUserSuggestions(
      req.currentUser?.userId as string,
      parseInt(limit as string),
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User suggestions fetched successfully",
      data: {
        suggestions,
      },
    });
  }

  static async searchUsers(req: Request, res: Response) {
    const { query } = req.query;

    const users = await UserServices.searchUsers(query as string);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
      },
    });
  }

  static async searchAutoCompleteUsers(req: Request, res: Response) {
    const { query } = req.query;

    const users = await UserServices.searchAutoCompleteUsers(query as string);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
      },
    });
  }

  @joiRequestValidator(basicInfoUpdateSchema)
  static async updateUserBasicInfo(req: Request, res: Response) {
    const data: IUserBasicInfo = req.body as IUserBasicInfo;

    for (const key in data) {
      await userCache.updateField(req.currentUser?.userId as string, key, JSON.stringify(data[key]));
    }

    updateUserBasicInfoMQ.addJob(GITDEV_USER_BASIC_INFO_UPDATE_JOB, {
      userId: req.currentUser?.userId as string,
      value: data,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User Info updated successfully",
    });
  }

  @joiRequestValidator(notificationSettingsSchema)
  static async updateNotificationSettings(req: Request, res: Response) {
    const { settings }: { settings: INotification } = req.body;

    await userCache.updateField(req.currentUser?.userId as string, "notifications", JSON.stringify(settings));

    updateNotificationSettingsMQ.addJob(GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_JOB, {
      userId: req.currentUser?.userId as string,
      value: settings,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Notification settings updated successfully",
    });
  }
}
