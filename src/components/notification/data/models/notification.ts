import { INotificationDocument } from "@components/notification/interfaces";
import { DateTime } from "luxon";
import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
      index: true,
    },
    relatedEntityType: {
      type: String,
      required: true,
      index: true,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      refPath: "relatedEntityType",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => DateTime.now().plus({ weeks: 1 }).toJSDate(),
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Notification = model<INotificationDocument>("Notification", notificationSchema);

export { Notification };
