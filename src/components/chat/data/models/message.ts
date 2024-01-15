import { IChatMessageDocument } from "@components/chat/interfaces";
import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: {
        type: String,
        enum: ["text", "image", "file", "gif"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        from: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reaction: {
          type: String,
          required: true,
        },
      },
    ],
    deleteForMe: {
      type: Boolean,
      default: false,
    },
    deleteForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Message = model<IChatMessageDocument>("Message", messageSchema);

export { Message };
