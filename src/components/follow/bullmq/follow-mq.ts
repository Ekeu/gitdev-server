import { BaseMQ } from "@config/bullmq/basemq";
import { GITDEV_FOLLOW_JOB, GITDEV_UNFOLLOW_JOB, GITDEV_FOLLOW_QUEUE, GITDEV_UNFOLLOW_QUEUE } from "../constants";
import { IFollowJob } from "../interfaces";
import { FollowWorker } from "./follow-worker";
import { Processor } from "bullmq";

class FollowMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IFollowJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const followMQ = new FollowMQ(GITDEV_FOLLOW_QUEUE, GITDEV_FOLLOW_JOB, FollowWorker.follow);
export const unFollowMQ = new FollowMQ(GITDEV_UNFOLLOW_QUEUE, GITDEV_UNFOLLOW_JOB, FollowWorker.unfollow);
