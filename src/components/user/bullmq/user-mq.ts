import { BaseMQ } from "@config/bullmq/basemq";
import { IUserJob } from "../interfaces";
import { UserWorker } from "./user-worker";
import { GITDEV_USER_QUEUE, GITDEV_USER_SIGNUP_JOB } from "../constants";

class UserMQ extends BaseMQ {
  constructor() {
    super(GITDEV_USER_QUEUE);
    this.processJob(GITDEV_USER_SIGNUP_JOB, UserWorker.createUser, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IUserJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const userMQ = new UserMQ();
