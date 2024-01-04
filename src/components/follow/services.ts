import { ApiError } from "@utils/errors/api-error";
import { Follow } from "./data/models/follow";
import { IFollowDocument, INewFollow, TFollows } from "./interfaces";
import { StatusCodes } from "http-status-codes";
import { User } from "@components/user/data/models/user";
import { getUserAuthLookup } from "@utils/common";
import { Types } from "mongoose";
import { IUserDocument } from "@components/user/interfaces";
import path from "path";
import { UserServices } from "@components/user/services";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { env } from "@/env";
import { NotificationServices } from "@components/notification/services";
import { emailFollowMQ } from "@components/mail/bullmq/mail-mq";
import { GITDEV_EMAIL_FOLLOW_JOB } from "@components/mail/constants";

export class FollowServices {
  static initFollowDocument(data: INewFollow): IFollowDocument {
    const follow = new Follow(data);
    return follow;
  }

  static async follow(data: INewFollow): Promise<IFollowDocument> {
    const { follower, following } = data;
    try {
      const follow = await Follow.create(data);

      await User.bulkWrite([
        {
          updateOne: {
            filter: { _id: new Types.ObjectId(follower) },
            update: { $inc: { followingCount: 1 } },
          },
        },
        {
          updateOne: {
            filter: { _id: new Types.ObjectId(following) },
            update: { $inc: { followersCount: 1 } },
          },
        },
      ]);

      const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "notification.ejs");
      const sender = await UserServices.getAuthLookUpData(follower, ["username"]);
      const receiver = await UserServices.getAuthLookUpData(following, ["email", "username"], ["notifications"]);
      const notificationLink = `${env.GITDEV_CLIENT_URL}/users/${follower}`;
      const message = `${(sender!.authUser as IAuthUserDocument)!.username} started following you`;

      NotificationServices.createAndSendNotification(
        {
          message,
          notificationLink,
          senderId: follower,
          entityType: "Follow",
          receiverId: following,
          ejsTemplatePath: ejsFile,
          relatedEntityId: follower,
          relatedEntityType: "User",
          entityId: follow._id.toString(),
          sendNotification: receiver!.notifications.follows,
          receiverEmail: (receiver!.authUser as IAuthUserDocument).email,
          receiverUsername: (receiver!.authUser as IAuthUserDocument).username,
        },
        emailFollowMQ,
        GITDEV_EMAIL_FOLLOW_JOB,
      );

      return follow;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async unfollow(follower: string, following: string): Promise<void> {
    try {
      const isFollowing = await Follow.exists({ follower, following });

      if (!isFollowing) {
        throw new ApiError("NotFollowing", StatusCodes.BAD_REQUEST, "You are not following this user");
      }

      await Follow.deleteOne({ follower, following });

      await User.bulkWrite([
        {
          updateOne: {
            filter: { _id: follower },
            update: { $inc: { followingCount: -1 } },
          },
        },
        {
          updateOne: {
            filter: { _id: following },
            update: { $inc: { followersCount: -1 } },
          },
        },
      ]);

      return;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getFollows(
    userId: string,
    type: TFollows,
    skip: number = 0,
    limit: number = 0,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<IUserDocument[]> {
    const matchField = type === "followers" ? "following" : "follower";
    const projectField = type === "followers" ? "follower" : "following";
    try {
      const followers = await Follow.aggregate([
        { $match: { [matchField]: new Types.ObjectId(userId) } },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        { $project: { [projectField]: 1 } },
        getUserAuthLookup({ user: { localField: projectField } }),
        { $unwind: "$user" },
      ]);

      return followers;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
