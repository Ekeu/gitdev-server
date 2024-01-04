import { Job } from "bullmq";
import { INotificationJob } from "../interfaces";
import { NotificationServices } from "../services";

export class NotificationWorker {
  static async markAsRead(job: Job<INotificationJob>): Promise<void> {
    await NotificationServices.markAsRead(job.data.notificationId);
  }

  static async deleteNotification(job: Job<INotificationJob>): Promise<void> {
    await NotificationServices.deleteNotification(job.data.notificationId);
  }
}
