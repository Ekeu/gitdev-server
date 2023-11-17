import { env } from "@/env";
import { logger } from "@config/logger";
import { createClient, RedisClientType } from "redis";

export abstract class RedisClient {
  client: RedisClientType;

  constructor(cache: string) {
    this.client = createClient({ url: env.GITDEV_REDIS_HOST });
    this.client.on("error", (error) => {
      logger.error(`Redis runtime error: ${error.message}.`, { error, cache });
    });
  }
}
