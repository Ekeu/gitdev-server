import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_REACTION_CREATE_JOB,
  GITDEV_REACTION_CREATE_QUEUE,
  GITDEV_REACTION_DELETE_JOB,
  GITDEV_REACTION_DELETE_QUEUE,
} from "../constants";
import { IReactionJob } from "../interfaces";
import { ReactionWorker } from "./reaction-worker";
import { Processor } from "bullmq";

class ReactionMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IReactionJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const createReactionMQ = new ReactionMQ(
  GITDEV_REACTION_CREATE_QUEUE,
  GITDEV_REACTION_CREATE_JOB,
  ReactionWorker.createReaction,
);
export const deleteReactionMQ = new ReactionMQ(
  GITDEV_REACTION_DELETE_QUEUE,
  GITDEV_REACTION_DELETE_JOB,
  ReactionWorker.deleteReaction,
);
