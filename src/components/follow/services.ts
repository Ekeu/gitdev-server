import { ApiError } from "@utils/errors/api-error";
import { Follow } from "./data/models/follow";
import { IFollowDocument, INewFollow, TFollows } from "./interfaces";
import { StatusCodes } from "http-status-codes";
import { User } from "@components/user/data/models/user";
import { getUserAuthLookup } from "@utils/common";
import { Types } from "mongoose";
import { IUserDocument } from "@components/user/interfaces";

export class FollowServices {
  static initFollowDocument(data: INewFollow): IFollowDocument {
    const follow = new Follow(data);
    return follow;
  }

  static async follow(data: INewFollow): Promise<IFollowDocument> {
    const { follower, following } = data;
    try {
      const follow = await Follow.create(data);

      const users = await User.bulkWrite([
        {
          updateOne: {
            filter: { _id: follower },
            update: { $inc: { followingCount: 1 } },
          },
        },
        {
          updateOne: {
            filter: { _id: following },
            update: { $inc: { followersCount: 1 } },
          },
        },
      ]);

      const followingUserProfile = await User.findOne({ _id: following }, { _id: 1, username: 1 });

      console.log(followingUserProfile);
      console.log(users);

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

      const follow = await Follow.deleteOne({ follower, following });

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

      console.log(follow);

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
