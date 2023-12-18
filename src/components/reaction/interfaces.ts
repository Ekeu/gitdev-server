import { IUserDocument } from "@components/user/interfaces";
import { Document, Types } from "mongoose";

export interface IReactions {
  upvote: number;
  downvote: number;
  smile: number;
  celebrate: number;
  insightful: number;
  love: number;
  rocket: number;
  eyes: number;
}

export interface IReactionDocument extends Document {
  [key: string]: any;
  _id: string;
  postId: string;
  createdAt: Date;
  type: string;
  updatedAt: Date;
  user: string | Types.ObjectId | IUserDocument;
}

export interface IReactionJob {
  postId: string;
  userId: string;
  type?: string;
  value?: INewReaction;
}

export interface INewReaction {
  postId: string;
  type: string;
  user: string | Types.ObjectId | IUserDocument;
}
export interface IReactionQuery {
  postId?: string | Types.ObjectId;
  _id?: string;
}
