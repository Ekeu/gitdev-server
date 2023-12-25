import { IUserDocument } from "@components/user/interfaces";
import { Types } from "mongoose";

export interface IVoteCommentDocument extends Document {
  commentId: string;
  user: string | IUserDocument;
  count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommentDocument extends Document {
  _id: string | Types.ObjectId;
  content: string;
  postId: string;
  user: string | IUserDocument | Types.ObjectId;
  parentCommentId?: string;
  childrenComments?: string[];
  votes?: IVoteCommentDocument[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateComment {
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string;
}

export interface ICommentQuery {
  postId?: string | Types.ObjectId;
  parentCommentId?: string;
}

export interface IGetComments {
  query: ICommentQuery;
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  userId: string;
}

export interface IVoteComment {
  commentId: string;
  userId: string;
  value: 1 | -1;
}

export interface IDeleteComment {
  commentId: string;
  userId: string;
  parentCommentId?: string;
}

export interface IUpdateComment {
  commentId: string;
  content: string;
  userId: string;
}
