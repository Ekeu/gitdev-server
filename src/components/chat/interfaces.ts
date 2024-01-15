import { IUserDocument } from "@components/user/interfaces";
import { Types } from "mongoose";

export interface IChatDocument extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessageDocument extends Document {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  from: Types.ObjectId | IUserDocument;
  to: Types.ObjectId | IUserDocument;
  message: {
    type: string;
    content: string;
  };
  isRead: boolean;
  reactions: {
    from: Types.ObjectId;
    reaction: string;
  }[];
  deleteForMe: boolean;
  deleteForEveryone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage {
  _id: string | Types.ObjectId;
  chat: string | Types.ObjectId;
  message: {
    type: string;
    content: string;
  };
  to: string;
  isRead: boolean;
  reactions?: {
    from: string;
    reaction: string;
  }[];
  from: string;
  deleteForMe?: boolean;
  deleteForEveryone?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessageEmit {
  from: IUserDocument;
  to: IUserDocument;
  message: {
    type: string;
    content: string;
  };
}

export interface IChatMessageNotification {
  from: string;
  to: string;
}

export interface IChatUsers {
  from: string;
  to: string;
}

export interface IChatDeleteMessageJob {
  messageId: string;
  deletionType: IChatDeletionType;
}

export interface IChatReadMessageJob {
  from: string;
  to: string;
}

export type IChatDeletionType = "forMe" | "forEveryone";

export interface IChatReaction {
  messageId: string;
  from: string;
  reaction: string;
}

export interface IChatIsTyping {
  from: string;
  to: string;
}
