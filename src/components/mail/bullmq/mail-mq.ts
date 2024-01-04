import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_EMAIL_FORGOT_QUEUE,
  GITDEV_EMAIL_FORGOT_PASSWORD_JOB,
  GITDEV_EMAIL_COMMENT_QUEUE,
  GITDEV_EMAIL_COMMENT_JOB,
  GITDEV_EMAIL_FOLLOW_QUEUE,
  GITDEV_EMAIL_FOLLOW_JOB,
  GITDEV_EMAIL_REACTION_QUEUE,
  GITDEV_EMAIL_REACTION_JOB,
} from "../constants";
import { IEmailJob } from "../interfaces";
import { MailWorker } from "./mail-worker";
import { Processor } from "bullmq";

export class EmailMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IEmailJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const emailForgotMQ = new EmailMQ(
  GITDEV_EMAIL_FORGOT_QUEUE,
  GITDEV_EMAIL_FORGOT_PASSWORD_JOB,
  MailWorker.sendEmail,
);
export const emailCommentMQ = new EmailMQ(GITDEV_EMAIL_COMMENT_QUEUE, GITDEV_EMAIL_COMMENT_JOB, MailWorker.sendEmail);
export const emailFollowMQ = new EmailMQ(GITDEV_EMAIL_FOLLOW_QUEUE, GITDEV_EMAIL_FOLLOW_JOB, MailWorker.sendEmail);
export const emailReactionMQ = new EmailMQ(
  GITDEV_EMAIL_REACTION_QUEUE,
  GITDEV_EMAIL_REACTION_JOB,
  MailWorker.sendEmail,
);
