import { IChatDocument } from "@components/chat/interfaces";
import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ from: 1, to: 1 }, { unique: true });

const Chat = model<IChatDocument>("Chat", chatSchema);

export { Chat };
