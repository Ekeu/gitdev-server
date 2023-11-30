import { BaseMQ } from "@config/bullmq/basemq";
import { GITDEV_EMAIL_QUEUE, GITDEV_EMAIL_FORGOT_PASSWORD_JOB } from "../constants";
import { IEmailJob } from "../interfaces";
import { MailWorker } from "./mail-worker";

class EmailMQ extends BaseMQ {
  constructor() {
    super(GITDEV_EMAIL_QUEUE);
    this.processJob(GITDEV_EMAIL_FORGOT_PASSWORD_JOB, MailWorker.sendEmail, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IEmailJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const emailMQ = new EmailMQ();
