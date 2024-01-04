import { ApiError } from "@utils/errors/api-error";
import { Notification } from "./data/models/notification";
import { ICommentCreateAndSendNotification, INotification, INotificationDocument } from "./interfaces";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { getUserAuthLookup } from "@utils/common";
import { IONotification } from "./socket";
import { MailServices } from "@components/mail/services";
import { EmailMQ } from "@components/mail/bullmq/mail-mq";

export class NotificationServices {
  public static async createNotification(notification: INotification): Promise<INotificationDocument> {
    try {
      const newNotification = await Notification.create(notification);
      return newNotification;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async getNotifications(
    userId: string,
    skip: number = 0,
    limit: number = 0,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<INotificationDocument[]> {
    try {
      const notifications = await Notification.aggregate([
        { $match: { receiver: new Types.ObjectId(userId) } },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        getUserAuthLookup({
          user: {
            localField: "sender",
            as: "sender",
          },
        }),
        { $unwind: "$sender" },
      ]);
      return notifications;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async createAndSendNotification(
    data: ICommentCreateAndSendNotification,
    emailQueue: EmailMQ,
    job: string,
  ): Promise<void> {
    const {
      senderId,
      receiverUsername,
      receiverEmail,
      receiverId,
      message,
      entityId,
      entityType,
      relatedEntityType,
      relatedEntityId,
      ejsTemplatePath,
      notificationLink,
    } = data;

    if (senderId === receiverId) return;

    await this.createNotification({
      message,
      entityId,
      entityType,
      relatedEntityId,
      sender: senderId,
      relatedEntityType,
      receiver: receiverId,
    } as INotification);

    const notifications = await this.getNotifications(senderId);

    IONotification.io.emit("notifications", notifications);

    const ejsTemplate = await MailServices.getEJSTemplate(ejsTemplatePath, {
      username: receiverUsername,
      message,
      notificationLink,
    });

    emailQueue.addJob(job, {
      value: {
        to: receiverEmail,
        subject: `[GitDev] ${message}`,
        html: ejsTemplate,
      },
    });
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await Notification.updateOne({ _id: notificationId }, { read: true });
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await Notification.deleteOne({ _id: notificationId });
  }
}
