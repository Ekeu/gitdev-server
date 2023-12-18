import { GITDEV_REACTION_ENUM } from "@components/reaction/constants";
import { IReactionDocument } from "@components/reaction/interfaces";
import { Schema, model } from "mongoose";

const reactionSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      index: true,
      required: true,
    },
    type: {
      type: String,
      enum: GITDEV_REACTION_ENUM,
      default: "",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

reactionSchema.index({ postId: 1, user: 1 }, { unique: true });

const Reaction = model<IReactionDocument>("Reaction", reactionSchema);

export { Reaction };
