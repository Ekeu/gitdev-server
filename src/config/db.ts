import mongoose from "mongoose";
import { logger } from "./logger";
import { env } from "src/env";

export const connectToDB = async (): Promise<void> => {
  const URI = env.GITDEV_MONGO_URL;
  try {
    await mongoose.connect(URI, {
      dbName: env.GITDEV_MONGO_DB,
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB: ", error);
    return process.exit(1);
  }
};
