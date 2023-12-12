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

class PostCreateMQ extends BaseMQ {
  constructor() {
    super(GITDEV_POST_CREATE_QUEUE);
    this.processJob(GITDEV_CREATE_POST_JOB, PostWorker.createPost, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IPostJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

class PostDeleteMQ extends BaseMQ {
  constructor() {
    super(GITDEV_POST_DELETE_QUEUE);
    this.processJob(GITDEV_DELETE_POST_JOB, PostWorker.deletePost, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IPostJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

class PostUpdateMQ extends BaseMQ {
  constructor() {
    super(GITDEV_POST_UPDATE_QUEUE);
    this.processJob(GITDEV_UPDATE_POST_JOB, PostWorker.updatePost, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IPostJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const postCreateMQ = new PostCreateMQ();
export const postDeleteMQ = new PostDeleteMQ();
export const postUpdateMQ = new PostUpdateMQ();
