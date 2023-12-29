import { GITDEV_FOLLOW_CACHE } from "@components/follow/constants";
import { IFollowRange, IPartialUserDocument } from "@components/follow/interfaces";
import { logger } from "@config/logger";
import { RedisClient } from "@config/redis/client";
import { ApiError } from "@utils/errors/api-error";
import _ from "lodash";

export class FollowCache extends RedisClient {
  constructor() {
    super(GITDEV_FOLLOW_CACHE);
  }

  async follow(follower: string, following: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const isFollowing = await this.client.ZSCORE(`following:${follower}`, following);

      if (isFollowing) return;

      const multi = this.client.multi();

      multi.ZADD(`followers:${following}`, { score: _.now(), value: follower });
      multi.ZADD(`following:${follower}`, { score: _.now(), value: following });
      multi.HINCRBY(`users:${follower}`, "followingCount", 1);
      multi.HINCRBY(`users:${following}`, "followersCount", 1);

      await multi.exec();
    } catch (error) {
      logger.error(`Failed saving follow data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async unfollow(follower: string, following: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const isFollowing = await this.client.ZSCORE(`following:${follower}`, following);

      if (!isFollowing) return;

      const multi = this.client.multi();

      multi.ZREM(`followers:${following}`, follower);
      multi.ZREM(`following:${follower}`, following);
      multi.HINCRBY(`users:${follower}`, "followingCount", -1);
      multi.HINCRBY(`users:${following}`, "followersCount", -1);

      await multi.exec();
    } catch (error) {
      logger.error(`Failed saving follow data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async get(key: string, range: IFollowRange): Promise<IPartialUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const res = await this.client.ZRANGE(key, range.start, range.end, { REV: true });

      if (res.length === 0) return [];

      const multi = this.client.multi();

      res.forEach((id) => {
        multi.HMGET(`users:${id}`, ["_id", "avatar"]);
      });

      const data = (await multi.exec()) as [[string, string]];

      const parsedUsers = data.map((userDataArr) => {
        const [_id, avatar] = userDataArr;
        return {
          _id: JSON.parse(_id),
          avatar: JSON.parse(avatar),
        } as IPartialUserDocument;
      });

      return parsedUsers;
    } catch (error) {
      logger.error(`Failed getting follow data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }
}

export const followCache = new FollowCache();
