import _ from "lodash";
import { IUserDocument } from "@components/user/interfaces";
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
}

export const userCache = new UserCache();
