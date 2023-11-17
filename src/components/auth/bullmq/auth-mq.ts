import { BaseMQ } from "@config/bullmq/basemq";
import { IAuthUserJob } from "../interfaces";
import { GITDEV_AUTH_QUEUE, GITDEV_AUTH_SIGNUP_JOB } from "../constants";
import { AuthWorker } from "./auth-worker";

class AuthMQ extends BaseMQ {
  constructor() {
    super(GITDEV_AUTH_QUEUE);
    this.processJob(GITDEV_AUTH_SIGNUP_JOB, AuthWorker.createAuthUser, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IAuthUserJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const authMQ = new AuthMQ();
