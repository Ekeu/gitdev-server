import { IPostDocument } from "@components/post/interfaces";
import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 150,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "followers"],
      default: "public",
    },
    tags: [String],
    commentsCount: {
      type: Number,
      default: 0,
    },
    reactions: {
      upvote: {
        type: Number,
        default: 0,
      },
      downvote: {
        type: Number,
        default: 0,
      },
      smile: {
        type: Number,
        default: 0,
      },
      celebrate: {
        type: Number,
        default: 0,
      },
      insightful: {
        type: Number,
        default: 0,
      },
      love: {
        type: Number,
        default: 0,
      },
      rocket: {
        type: Number,
        default: 0,
      },
      eyes: {
        type: Number,
        default: 0,
      },
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authUser: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Post = model<IPostDocument>("Post", postSchema);

export { Post };
