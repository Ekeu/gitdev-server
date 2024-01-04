import express, { Router } from "express";
import { NotificationControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class NotificationRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method PATCH
     * @param {string} path - "/notifications/:notificationId"
     * @description - Marks a notification as read
     */
    router.patch(
      "/notifications/:notificationId",
      AuthMiddleware.isAuthtenticated,
      NotificationControllers.readNotification,
    );

    /**
     * @method DELETE
     * @param {string} path - "/notifications/:notificationId"
     * @description - Deletes a notification
     */
    router.delete(
      "/notifications/:notificationId",
      AuthMiddleware.isAuthtenticated,
      NotificationControllers.deleteNotification,
    );

    /**
     * @method GET
     * @param {string} path - "/notifications/:page"
     * @description - Gets all notifications for a user
     */
    router.get("/notifications/:page", AuthMiddleware.isAuthtenticated, NotificationControllers.getNotifications);

    return router;
  }
}
