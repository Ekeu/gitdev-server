import { Request, Response } from "express";
import { IONotification } from "./socket";
import { deleteNotificationMQ, readNotificationMQ } from "./bullmq/notification-mq";
import {
  GITDEV_NOTIFICATION_DELETE_JOB,
  GITDEV_NOTIFICATION_PAGE_SIZE,
  GITDEV_NOTIFICATION_READ_JOB,
} from "./constants";
import { StatusCodes } from "http-status-codes";
import { NotificationServices } from "./services";
import { notificationPaginationSchema, notificationSchema } from "./data/joi-schemes/notification";
import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";

export class NotificationControllers {
  @joiRequestValidator(notificationSchema, { body: false, params: true })
  static async readNotification(req: Request, res: Response) {
    const { notificationId } = req.params;
    IONotification.io.emit("notification", notificationId);

    readNotificationMQ.addJob(GITDEV_NOTIFICATION_READ_JOB, { notificationId });

    return res.status(StatusCodes.OK).json({ message: "Notification read", success: true });
  }

  @joiRequestValidator(notificationSchema, { body: false, params: true })
  static async deleteNotification(req: Request, res: Response) {
    const { notificationId } = req.params;
    IONotification.io.emit("notification", notificationId);

    deleteNotificationMQ.addJob(GITDEV_NOTIFICATION_DELETE_JOB, { notificationId });

    return res.status(StatusCodes.OK).json({ message: "Notification deleted", success: true });
  }

  @joiRequestValidator(notificationPaginationSchema, { body: false, params: true })
  static async getNotifications(req: Request, res: Response) {
    const { page } = req.params;

    const skip = (parseInt(page) - 1) * GITDEV_NOTIFICATION_PAGE_SIZE;
    const limit = GITDEV_NOTIFICATION_PAGE_SIZE * parseInt(page);

    const notifications = await NotificationServices.getNotifications(req.currentUser!.userId, skip, limit);

    return res.status(StatusCodes.OK).json({ success: true, data: notifications });
  }
}
