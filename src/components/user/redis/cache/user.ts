import _ from "lodash";
import { IUserDocument, TUserBlockAction } from "@components/user/interfaces";
import { logger } from "@config/logger";
import { ApiError } from "@utils/errors/api-error";
import { RedisClient } from "@config/redis/client";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { parseRedisData } from "@utils/common";
import { GITDEV_USER_CACHE } from "@components/user/constants";

export class UserCache extends RedisClient {
  constructor() {
    super(GITDEV_USER_CACHE);
  }

  async save(collection: string, key: string, redisId: string, user: IUserDocument | IAuthUserDocument) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const multi = this.client.multi();
      multi.ZADD(`${collection}`, {
        score: parseInt(redisId, 10),
        value: key,
      });
      _.entries(user).forEach(([field, value]) => {
        multi.HSET(`${collection}:${key}`, field, JSON.stringify(value));
      });
      await multi.exec();
    } catch (error) {
      logger.error(`Failed to save user data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async get(collection: string, key: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const data = (await this.client.HGETALL(`${collection}:${key}`)) as IUserDocument | IAuthUserDocument;

      const parsedData = _.isEmpty(data) ? null : parseRedisData(data);

      if (!parsedData) return null;

      return {
        ...parsedData,
        createdAt: new Date(parsedData.createdAt),
        updatedAt: new Date(parsedData.updatedAt),
      };
    } catch (error) {
      logger.error(`Error getting user data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async updateField(key: string, field: string, value: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`users:${key}`, field, JSON.stringify(value));
    } catch (error) {
      logger.error(`Error updating user field: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async updateUserBlockList(userId: string, blockedUserId: string, action: TUserBlockAction) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userKey = `users:${userId}`;
      const blockedUserKey = `users:${blockedUserId}`;

      const _blocked = await this.client.HGET(`${userKey}`, "blocked");
      const _blockedBy = await this.client.HGET(`${blockedUserKey}`, "blockedBy");

      const blocked = _blocked ? JSON.parse(_blocked) : [];
      const blockedBy = _blockedBy ? JSON.parse(_blockedBy) : [];

      const multi = this.client.multi();

      if (action === "block") {
        if (!blocked.includes(blockedUserId)) {
          blocked.push(blockedUserId);
        }
        if (!blockedBy.includes(userId)) {
          blockedBy.push(userId);
        }
        multi.HSET(userKey, "blocked", JSON.stringify(blocked));
        multi.HSET(blockedUserKey, "blockedBy", JSON.stringify(blockedBy));
      } else {
        if (blocked.includes(blockedUserId)) {
          _.pull(blocked, blockedUserId);
        }
        if (blockedBy.includes(userId)) {
          _.pull(blockedBy, userId);
        }
        multi.HSET(userKey, "blocked", JSON.stringify(blocked));
        multi.HSET(blockedUserKey, "blockedBy", JSON.stringify(blockedBy));
      }

      await multi.exec();
    } catch (error) {
      logger.error(`Error updating block list: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }
}

export const userCache = new UserCache();
