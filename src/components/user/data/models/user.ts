import { IUserDocument } from "@components/user/interfaces";
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    bio: {
      type: String,
      maxlength: 160,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    blocked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    social: [
      {
        name: String,
        url: String,
      },
    ],
    authUser: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
    notifications: {
      messages: {
        type: Boolean,
        default: true,
      },
      follows: {
        type: Boolean,
        default: true,
      },
      reactions: {
        type: Boolean,
        default: true,
      },
      comments: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = model<IUserDocument>("User", userSchema);

export { User };
