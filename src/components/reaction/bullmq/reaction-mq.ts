import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_REACTION_CREATE_JOB,
  GITDEV_REACTION_CREATE_QUEUE,
  GITDEV_REACTION_DELETE_JOB,
  GITDEV_REACTION_DELETE_QUEUE,
} from "../constants";
import { IReactionJob } from "../interfaces";
import { ReactionWorker } from "./reaction-worker";

class CreateReactionMQ extends BaseMQ {
  constructor() {
    super(GITDEV_REACTION_CREATE_QUEUE);
    this.processJob(GITDEV_REACTION_CREATE_JOB, ReactionWorker.createReaction, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IReactionJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

class DeleteReactionMQ extends BaseMQ {
  constructor() {
    super(GITDEV_REACTION_DELETE_QUEUE);
    this.processJob(GITDEV_REACTION_DELETE_JOB, ReactionWorker.deleteReaction, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IReactionJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const createReactionMQ = new CreateReactionMQ();
export const deleteReactionMQ = new DeleteReactionMQ();
