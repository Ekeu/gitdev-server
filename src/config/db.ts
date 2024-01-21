import mongoose from "mongoose";
import { logger } from "./logger";
import { env } from "@/env";
import AxiosDigestAuth from "@mhoc/axios-digest-auth";
import { redisConnection } from "./redis/connection";

const da = new AxiosDigestAuth({
  username: env.GITDEV_MONGO_PUBLIC_API_KEY,
  password: env.GITDEV_MONGO_PRIVATE_API_KEY,
});

const findIndexByName = async (collectionName: string, indexName: string) => {
  try {
    const { data } = await da.request({
      url: `${env.GITDEV_MONGO_SEARCH_INDEX_API_URL}/${env.GITDEV_MONGO_DB}/${collectionName}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.atlas.2023-01-01+json",
      },
      method: "GET",
    });

    return (data as any[]).find((index) => index.name === indexName);
  } catch (error) {
    logger.error("Error fetching collection indexes: ", error);
  }
};

export const createSearchIndex = async (collectionName: string, indexName: string) => {
  try {
    const index = await findIndexByName(collectionName, indexName);
    if (index) {
      logger.info(`The search index ${indexName} already exists`);
      return;
    }
    await da.request({
      url: env.GITDEV_MONGO_SEARCH_INDEX_API_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.atlas.2023-01-01+json",
      },
      method: "POST",
      data: {
        collectionName,
        name: indexName,
        database: env.GITDEV_MONGO_DB,
        mappings: {
          dynamic: true,
        },
      },
    });
    logger.info(`The search index ${indexName} was created successfully`);
  } catch (error) {
    logger.error("Error creating search index: ", error);
  }
};

export const createAutoCompleteIndex = async (collectionName: string, indexName: string) => {
  try {
    const index = await findIndexByName(collectionName, indexName);
    if (index) {
      logger.info(`The autocomplete index ${indexName} already exists`);
      return;
    }
    await da.request({
      url: env.GITDEV_MONGO_SEARCH_INDEX_API_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.atlas.2023-01-01+json",
      },
      method: "POST",
      data: {
        collectionName,
        name: indexName,
        database: env.GITDEV_MONGO_DB,
        mappings: {
          dynamic: false,
          fields: {
            username: [
              {
                foldDiacritics: false,
                maxGrams: 7,
                minGrams: 3,
                tokenization: "edgeGram",
                type: "autocomplete",
              },
            ],
          },
        },
      },
    });
    logger.info(`The autocomplete index ${indexName} was created successfully`);
  } catch (error) {
    logger.error("Error creating autocomplete index: ", error);
  }
};

export const connectToDB = async (): Promise<void> => {
  const URI = env.GITDEV_MONGO_URL;
  try {
    await mongoose.connect(URI, {
      dbName: env.GITDEV_MONGO_DB,
    });
    logger.info("Connected to MongoDB");
    await redisConnection.connect();
  } catch (error) {
    logger.error("Error connecting to MongoDB: ", error);
    return process.exit(1);
  }
};
