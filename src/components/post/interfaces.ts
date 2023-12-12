import { IAuthUserDocument } from "@components/auth/interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { RedisCommandRawReply } from "@redis/client/dist/lib/commands";
import { Document, Types } from "mongoose";

interface IReactions {
  upvote: number;
  downvote: number;
  smile: number;
  celebrate: number;
  insightful: number;
  love: number;
  rocket: number;
  eyes: number;
}

export interface INewPost {
  title: string;
  content: string;
  commentsEnabled: boolean;
  tags: string[];
  privacy: string;
  user: string;
  authUser: string;
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
  authUser: string | Types.ObjectId | IAuthUserDocument;
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
