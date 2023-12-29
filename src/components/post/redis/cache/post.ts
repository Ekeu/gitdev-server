import { GITDEV_POST_CACHE } from "@components/post/constants";
import { IPostCache, IPostDocument, IPostRange, IZRangeOptions, TMultiPost } from "@components/post/interfaces";
import { logger } from "@config/logger";
import { RedisClient } from "@config/redis/client";
import { parseRedisData } from "@utils/common";
import { ApiError } from "@utils/errors/api-error";
import _ from "lodash";

export class PostCache extends RedisClient {
  constructor() {
    super(GITDEV_POST_CACHE);
  }

  async save(data: IPostCache) {
    const { key, redisId, userId, post } = data;

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const multi = this.client.multi();
      multi.ZADD("posts", {
        score: parseInt(redisId, 10),
        value: key,
      });
      _.entries(post).forEach(([field, value]) => {
        multi.HSET(`posts:${key}`, field, JSON.stringify(value));
      });
      multi.HINCRBY(`users:${userId}`, "postsCount", 1);
      await multi.exec();
    } catch (error) {
      logger.error(`Failed saving post data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async get(range: IPostRange, options?: IZRangeOptions): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const res: string[] = await this.client.ZRANGE("posts", range.start, range.end, {
        REV: true,
        ...(options ? options : {}),
      });

      if (!res.length) return [];

      const multi = this.client.multi();

      res.forEach((id) => {
        multi.HGETALL(`posts:${id}`);
      });

      const data = (await multi.exec()) as TMultiPost;

      const parsedPosts = (data as IPostDocument[]).map((post) => {
        return _.isEmpty(post) ? null : parseRedisData(post);
      });

      return (parsedPosts as (IPostDocument | null)[])
        .filter((post): post is IPostDocument => post !== null)
        .map((post) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        })) as IPostDocument[];
    } catch (error) {
      logger.error(`Error getting posts data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async getOne(key: string): Promise<IPostDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const data = (await this.client.HGETALL(`posts:${key}`)) as IPostDocument;

      const parsedData = _.isEmpty(data) ? null : parseRedisData(data);

      if (!parsedData) return null;

      return {
        ...parsedData,
        createdAt: new Date(parsedData.createdAt),
        updatedAt: new Date(parsedData.updatedAt),
      } as IPostDocument;
    } catch (error) {
      logger.error(`Error getting post data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async count(userId?: string): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      if (userId) {
        return await this.client.ZCOUNT("posts", userId, userId);
      }
      return await this.client.ZCARD("posts");
    } catch (error) {
      logger.error(`Error getting the number of posts in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async delete(key: string, userId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const multi = this.client.multi();
      multi.ZREM("posts", key);
      multi.DEL(`posts:${key}`);
      // multi.DEL(`comments:${key}`);
      // multi.DEL(`reactions:${key}`);
      multi.HINCRBY(`users:${userId}`, "postsCount", -1);
      await multi.exec();
    } catch (error) {
      logger.error(`Error deleting post data in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async update(key: string, post: IPostDocument): Promise<IPostDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const multi = this.client.multi();
      _.entries(post).forEach(([field, value]) => {
        multi.HSET(`posts:${key}`, field, JSON.stringify(value));
      });
      multi.HSET(`posts:${key}`, "updatedAt", JSON.stringify(new Date()));
      await multi.exec();

      const data = (await this.client.HGETALL(`posts:${key}`)) as IPostDocument;

      const parsedData = parseRedisData(data) as IPostDocument;

      return {
        ...parsedData,
        createdAt: new Date(parsedData.createdAt),
        updatedAt: new Date(parsedData.updatedAt),
      } as IPostDocument;
    } catch (error) {
      logger.error(`Error updating post data in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }
}

export const postCache = new PostCache();
