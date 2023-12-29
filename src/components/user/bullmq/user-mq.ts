import { BaseMQ } from "@config/bullmq/basemq";
import { IUserBlockListJob, IUserJob } from "../interfaces";
import { UserWorker } from "./user-worker";
import {
  GITDEV_USER_BLOCK_LIST_QUEUE,
  GITDEV_USER_QUEUE,
  GITDEV_USER_SIGNUP_JOB,
  GITDEV_USER_BLOCK_LIST_JOB,
} from "../constants";
import { Processor } from "bullmq";

class UserMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IUserJob | IUserBlockListJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const userMQ = new UserMQ(GITDEV_USER_QUEUE, GITDEV_USER_SIGNUP_JOB, UserWorker.createUser);
export const updateUserBlockListMQ = new UserMQ(
  GITDEV_USER_BLOCK_LIST_QUEUE,
  GITDEV_USER_BLOCK_LIST_JOB,
  UserWorker.updateUserBlockList,
);
