import { IAuthUserDocument } from "@components/auth/interfaces";
import { Document, ObjectId } from "mongoose";

/**
 * @interface IUserDocument
 *
 * @description This interface is used to define the shape of the user object.
 * The optional properties will not be saved along withe the user document.
 * It's added because, while the auth document will only be saved in the DB,
 * the user document will be saved in the DB and also in the redis cache.
 */

export interface IUserDocument extends Document {
  [key: string]: any;
  bio: string;
  avatar: string;
  website: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
  location: string;
  postsCount: number;
  blocked: ObjectId[];
  blockedBy: ObjectId[];
  _id: string | ObjectId;
  followersCount: number;
  followingCount: number;
  social: ISocial[];
  authUser: string | ObjectId | IAuthUserDocument;
  notifications: INotification;
}

export interface IPasswordReset {
  email: string;
  username: string;
  ipaddress: string;
  date: Date | string;
}

export interface INotification {
  messages: boolean;
  follows: boolean;
  reactions: boolean;
  comments: boolean;
}
export interface ISocial {
  name: string;
  url: string;
}

export interface IUserBasicInfo {
  [key: string]: any;
  website: string;
  company: string;
  location: string;
  bio: string;
  social: ISocial[];
}

export interface IUserBasicInfoJob {
  userId: string;
  value: IUserBasicInfo;
}

export interface INotificationSettingsJob {
  userId: string;
  value: INotification;
}

export interface IUserJob {
  value: string | IUserDocument;
}

export interface IUserAvatarJob {
  userId: string;
  avatar: string;
}

export interface IUserBlockListJob {
  userId: string;
  blockedUserId: string;
  action: TUserBlockAction;
}

export interface IUserJobResponse {
  _id: string | ObjectId;
}

export type TUserBlockAction = "block" | "unblock";
