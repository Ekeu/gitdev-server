import { logger } from "@config/logger";
import { RedisClient } from "./client";
import { GITDEV_REDIS_CONNECTION_NAME } from "@/constants";

class RedisConnection extends RedisClient {
  constructor() {
    super(GITDEV_REDIS_CONNECTION_NAME);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info("Redis connection established successfully");
    } catch (error) {
      logger.error(`Redis connection error: ${(error as Error).message}.`, { error });
    }
  }
}

export const redisConnection = new RedisConnection();
