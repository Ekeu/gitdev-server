import { ICommentDocument, IVoteCommentDocument } from "@components/comment/interfaces";
import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    childrenComments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    votes: [
      {
        type: Schema.Types.ObjectId,
        ref: "CommentVote",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const commentVoteSchema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  count: {
    type: Number,
    enum: [-1, 1],
    default: 0,
    required: true,
  },
});

commentVoteSchema.index({ commentId: 1, user: 1 }, { unique: true });

const Comment = model<ICommentDocument>("Comment", commentSchema);
const VoteComment = model<IVoteCommentDocument>("CommentVote", commentVoteSchema);

export { Comment, VoteComment };
