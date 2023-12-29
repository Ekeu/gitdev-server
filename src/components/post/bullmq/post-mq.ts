import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_CREATE_POST_JOB,
  GITDEV_UPDATE_POST_JOB,
  GITDEV_DELETE_POST_JOB,
  GITDEV_POST_UPDATE_QUEUE,
  GITDEV_POST_CREATE_QUEUE,
  GITDEV_POST_DELETE_QUEUE,
} from "../constants";
import { IPostJob } from "../interfaces";
import { PostWorker } from "./post-worker";
import { Processor } from "bullmq";

class PostMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IPostJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const createPostMQ = new PostMQ(GITDEV_POST_CREATE_QUEUE, GITDEV_CREATE_POST_JOB, PostWorker.createPost);
export const deletePostMQ = new PostMQ(GITDEV_POST_DELETE_QUEUE, GITDEV_DELETE_POST_JOB, PostWorker.deletePost);
export const updatedPostMQ = new PostMQ(GITDEV_POST_UPDATE_QUEUE, GITDEV_UPDATE_POST_JOB, PostWorker.updatePost);
