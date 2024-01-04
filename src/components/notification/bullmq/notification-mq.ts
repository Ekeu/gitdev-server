import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_NOTIFICATION_DELETE_JOB,
  GITDEV_NOTIFICATION_DELETE_QUEUE,
  GITDEV_NOTIFICATION_READ_JOB,
  GITDEV_NOTIFICATION_READ_QUEUE,
} from "../constants";
import { INotificationJob } from "../interfaces";
import { NotificationWorker } from "./notification-worker";
import { Processor } from "bullmq";

class NotificationMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: INotificationJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const readNotificationMQ = new NotificationMQ(
  GITDEV_NOTIFICATION_READ_QUEUE,
  GITDEV_NOTIFICATION_READ_JOB,
  NotificationWorker.markAsRead,
);
export const deleteNotificationMQ = new NotificationMQ(
  GITDEV_NOTIFICATION_DELETE_QUEUE,
  GITDEV_NOTIFICATION_DELETE_JOB,
  NotificationWorker.deleteNotification,
);
