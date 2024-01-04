import { Document, Types } from "mongoose";

export interface INotificationDocument extends Document {
  sender: string;
  receiver: string;
  entityType: string;
  entityId: string | Types.ObjectId;
  relatedEntityType: string;
  relatedEntityId: string | Types.ObjectId;
  message: string;
  read?: boolean;
  expiresAt?: Date;
}

export interface INotification {
  sender: string;
  receiver: string;
  message: string;
  entityType: string;
  entityId: string;
  relatedEntityType: string;
  relatedEntityId: string;
}

export interface ICommentCreateAndSendNotification {
  message: string;
  senderId: string;
  entityId: string;
  receiverId: string;
  entityType: string;
  receiverEmail: string;
  receiverUsername: string;
  ejsTemplatePath: string;
  relatedEntityId: string;
  notificationLink: string;
  relatedEntityType: string;
  sendNotification: boolean;
}

export interface INotificationJob {
  notificationId: string;
}
