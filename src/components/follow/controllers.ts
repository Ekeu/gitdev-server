import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { Request, Response } from "express";
import { followSchema, getFollowsSchema, unfollowSchema } from "./data/joi-schemes/follow";
import { followCache } from "./redis/cache/follow";
import { userCache } from "@components/user/redis/cache/user";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
import { IOFollow } from "./socket";
import { ApiError } from "@utils/errors/api-error";
import { UserServices } from "@components/user/services";
import { GITDEV_FOLLOW_JOB, GITDEV_UNFOLLOW_JOB, GITDEV_IO_FOLLOW, GITDEV_FOLLOW_PAGE_SIZE } from "./constants";
import { FollowServices } from "./services";
import { followMQ, unFollowMQ } from "./bullmq/follow-mq";
import { IFollowRange, IPartialUserDocument, TFollows } from "./interfaces";
import { IAuthUserDocument } from "@components/auth/interfaces";

export class FollowControllers {
  @joiRequestValidator(followSchema, { body: false, params: true })
  static async follow(req: Request, res: Response): Promise<void> {
    const { followingId } = req.params;

    // Update following, followers and users cache
    await followCache.follow(req.currentUser?.userId as string, followingId);

    // Get data of user being followed
    let user = await userCache.get("users", `${followingId}`);

    if (!user) {
      user = await UserServices.getSelectedFieldsById(followingId, ["_id", "username"]);
    }

    if (!user) {
      throw new ApiError("UserNotFound", StatusCodes.NOT_FOUND, "User not found");
    }

    const data = _.pick(user, ["_id", "username"]);
    // Send data to client via socket
    IOFollow.io.emit(GITDEV_IO_FOLLOW, data);

    const doc = FollowServices.initFollowDocument({
      follower: req.currentUser?.userId as string,
      following: followingId,
    });

    followMQ.addJob(GITDEV_FOLLOW_JOB, { value: doc.toObject() });

    // Send response to client
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Followed successfully",
    });
  }

  @joiRequestValidator(unfollowSchema, { body: false, params: true })
  static async unfollow(req: Request, res: Response): Promise<void> {
    const { followingId } = req.params;

    // Update following, followers and users cache
    await followCache.unfollow(req.currentUser?.userId as string, followingId);

    unFollowMQ.addJob(GITDEV_UNFOLLOW_JOB, {
      follower: req.currentUser?.userId as string,
      following: followingId,
    });

    // Send response to client
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unfollowed successfully",
    });
  }

  @joiRequestValidator(getFollowsSchema, { body: false, params: true })
  static async getFollows(req: Request, res: Response): Promise<void> {
    const { type, userId, page } = req.params;

    const skip = (parseInt(page) - 1) * GITDEV_FOLLOW_PAGE_SIZE;
    const limit = GITDEV_FOLLOW_PAGE_SIZE * parseInt(page);
    const _userId = userId || req.currentUser?.userId;

    const range: IFollowRange = {
      start: skip === 0 ? skip : skip + 1,
      end: limit,
    };

    let follows: IPartialUserDocument[] = [];

    const cachedFollows = await followCache.get(`${type}:${_userId}`, range);

    if (cachedFollows?.length) {
      follows = cachedFollows;
      for (let index = 0; index < follows.length; index++) {
        const user = await UserServices.getAuthLookUpData(follows[index]._id.toString(), ["username"], []);
        follows[index].username = (user?.authUser as IAuthUserDocument).username as string;
      }
    } else {
      const _follows = await FollowServices.getFollows(_userId as string, type as TFollows, skip, limit);
      follows = _follows.map((data) => ({
        _id: data.user._id,
        avatar: data.user.avatar,
        username: (data.authUser as IAuthUserDocument).username,
      })) as IPartialUserDocument[];
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${_.capitalize(type)} fetched successfully`,
      data: follows,
    });
  }
}
