import { GITDEV_REACTION_CACHE } from "@components/reaction/constants";
import { INewReaction, IReactionDocument } from "@components/reaction/interfaces";
import { logger } from "@config/logger";
import { RedisClient } from "@config/redis/client";
import { ApiError } from "@utils/errors/api-error";

export class ReactionCache extends RedisClient {
  constructor() {
    super(GITDEV_REACTION_CACHE);
  }

  async save(key: string, reaction: INewReaction, type: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionKey = `${key}:${reaction.user}`;

      const previousReaction = await this.client.HGET(`reactions:${key}`, reactionKey);

      const parsedReaction = JSON.parse(previousReaction as string) as INewReaction;

      if (previousReaction) {
        await this.delete(key, reaction.user as string, parsedReaction.type);
        if (parsedReaction.type === type) return;
      }

      await this.client.HSET(`reactions:${key}`, reactionKey, JSON.stringify(reaction));

      const postReactions = await this.client.HGET(`posts:${key}`, "reactions");
      const parsedPostReactions = JSON.parse(postReactions as string) as Record<string, number>;

      parsedPostReactions[type]++;

      await this.client.HSET(`posts:${key}`, "reactions", JSON.stringify(parsedPostReactions));
    } catch (error) {
      logger.error(`Failed to save reaction data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async delete(key: string, userId: string, type: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionKey = `${key}:${userId}`;

      await this.client.HDEL(`reactions:${key}`, reactionKey);

      const postReactions = await this.client.HGET(`posts:${key}`, "reactions");
      const parsedPostReactions = JSON.parse(postReactions as string) as Record<string, number>;

      parsedPostReactions[type]--;

      await this.client.HSET(`posts:${key}`, "reactions", JSON.stringify(parsedPostReactions));
    } catch (error) {
      logger.error(`Failed to save reaction data to cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async get(key: string): Promise<{ reactions: IReactionDocument[]; total: number }> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionsCache = (await this.client.HGETALL(`reactions:${key}`)) as Record<string, string>;

      const reactions: IReactionDocument[] = [];

      if (!reactionsCache) return { reactions, total: 0 };

      for (const reactionKey in reactionsCache) {
        const parsedReaction = JSON.parse(reactionsCache[reactionKey]) as IReactionDocument;
        reactions.push(parsedReaction);
      }

      const total = reactions.length;

      return { reactions, total };
    } catch (error) {
      logger.error(`Failed to get reaction data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async getPostReactionByUser(key: string, userId: string): Promise<IReactionDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reaction = await this.client.HGET(`reactions:${key}`, `${key}:${userId}`);

      if (!reaction) return null;

      return JSON.parse(reaction) as IReactionDocument;
    } catch (error) {
      logger.error(`Failed to get reaction data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async getReactionsByUser(userId: string): Promise<{ reactions: IReactionDocument[]; total: number }> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const keys = await this.client.KEYS("reactions:*");

      const reactions: IReactionDocument[] = [];

      if (!keys.length) return { reactions, total: 0 };

      const multi = this.client.multi();

      for (const key of keys) {
        const postId = key.split(":")[1];
        multi.HGET(`reactions:${postId}`, `${postId}:${userId}`);
      }

      const reactionsCache = await multi.exec();

      const filteredReactionsCache = reactionsCache.filter((reaction) => Boolean(reaction));

      for (const reaction of filteredReactionsCache) {
        const parsedReaction = JSON.parse(reaction as string) as IReactionDocument;
        reactions.push(parsedReaction);
      }

      return { reactions, total: reactions.length };
    } catch (error) {
      logger.error(`Failed to get reaction data from cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }
}

export const reactionCache = new ReactionCache();
