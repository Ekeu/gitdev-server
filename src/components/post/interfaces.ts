import { IReactions } from "@components/reaction/interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { RedisCommandRawReply } from "@redis/client/dist/lib/commands";
import { Document, Types } from "mongoose";

export interface INewPost {
  title: string;
  content: string;
  commentsEnabled: boolean;
  tags: string[];
  privacy: string;
  user: string;
}

export interface IPostCache {
  key: string;
  userId: string;
  redisId: string;
  post: IPostDocument;
}

export interface IPostDocument extends Document {
  [key: string]: any;
  title: string;
  content: string;
  privacy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<string>;
  commentsCount: number;
  reactions: IReactions;
  commentsEnabled: boolean;
  _id: string | Types.ObjectId;
  user: string | Types.ObjectId | IUserDocument;
}

export interface IZRangeOptions {
  BY?: "SCORE" | "LEX";
  REV?: true;
  LIMIT?: {
    offset: number;
    count: number;
  };
}

export interface IPostRange {
  start: number;
  end: number;
}

export interface IPostJob {
  value?: INewPost | IPostDocument;
  postId?: string;
  userId?: string;
}

export interface IPostQuery {
  _id?: string | Types.ObjectId;
  username?: string;
}

export interface INewPostJobResponse {
  _id: string;
}

export type TMultiPost = RedisCommandRawReply[] | IPostDocument[];
