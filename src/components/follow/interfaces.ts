import { IUserDocument } from "@components/user/interfaces";
import { Document } from "mongoose";

export interface INewFollow {
  username?: string;
  follower: string;
  following: string;
}

export interface IFollowDocument extends Document {
  follower: string | IUserDocument;
  following: string | IUserDocument;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollowJob {
  value?: INewFollow | IFollowDocument;
  follower?: string;
  following?: string;
}

export interface INewFollowJobResponse {
  _id: string;
}

export interface IFollowRange {
  start: number;
  end: number;
}

export interface IPartialUserDocument {
  _id: string;
  avatar: string;
  username: string;
}

export type TFollows = "followers" | "following";
