import { Comment, VotesComment } from "./data/models/comment";
import {
  ICommentDocument,
  IVoteComment,
  ICreateComment,
  IGetComments,
  IDeleteComment,
  IUpdateComment,
} from "./interfaces";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { ApiError } from "@utils/errors/api-error";
import { IUserDocument } from "@components/user/interfaces";
import { env } from "@/env";
import { getUserAuthLookup } from "@utils/common";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { Types } from "mongoose";
import { PostServices } from "@components/post/services";
import { UserServices } from "@components/user/services";
import { NotificationServices } from "@components/notification/services";
import { GITDEV_EMAIL_COMMENT_JOB } from "@components/mail/constants";
import { emailCommentMQ } from "@components/mail/bullmq/mail-mq";

export class CommentServices {
  static async createComment(data: ICreateComment): Promise<ICommentDocument> {
    const { content, postId, userId, parentCommentId } = data;

    try {
      const doc: ICommentDocument = await Comment.create({
        content,
        postId,
        user: userId,
        parentCommentId,
      });

      const post = await PostServices.findPostById(postId, {
        authUser: { fields: ["email", "username"] },
        user: { fields: ["notifications"] },
      });
      const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "notification.ejs");
      const user = await UserServices.getAuthLookUpData(userId, ["username"]);
      const username = (user!.authUser as IAuthUserDocument).username;
      const notificationLink = `${env.GITDEV_CLIENT_URL}/posts/${postId}?commentId=${doc._id.toString()}`;

      if (parentCommentId) {
        await Comment.updateOne({ _id: parentCommentId }, { $push: { childrenComments: doc._id } });

        const data = await Comment.aggregate([
          { $match: { _id: new Types.ObjectId(parentCommentId) } },
          getUserAuthLookup({ authUser: { fields: ["email"] }, user: { fields: ["notifications"] } }),
          {
            $unwind: "$user",
          },
        ]);

        const parentComment = data[0] as ICommentDocument;

        if (!parentComment) {
          throw new ApiError("CommentNotFound", StatusCodes.NOT_FOUND, "Parent comment not found");
        }

        const receiver = (parentComment.user as IUserDocument)._id.toString();
        const email = ((parentComment.user as IUserDocument).authUser as IAuthUserDocument).email;
        const message = `${username} replied to your comment`;

        NotificationServices.createAndSendNotification(
          {
            message,
            senderId: userId,
            notificationLink,
            receiverEmail: email,
            receiverId: receiver,
            entityType: "Comment",
            relatedEntityId: postId,
            ejsTemplatePath: ejsFile,
            receiverUsername: ((parentComment.user as IUserDocument).authUser as IAuthUserDocument).username,
            relatedEntityType: "Post",
            entityId: doc._id.toString(),
            sendNotification: (parentComment.user as IUserDocument).notifications.comments,
          },
          emailCommentMQ,
          GITDEV_EMAIL_COMMENT_JOB,
        );
      } else {
        if (post) {
          const receiver = (post.user as IUserDocument)._id.toString();
          const email = ((post.user as IUserDocument).authUser as IAuthUserDocument).email;
          const message = `${username} commented on your post`;

          NotificationServices.createAndSendNotification(
            {
              message,
              senderId: userId,
              notificationLink,
              receiverId: receiver,
              receiverEmail: email,
              entityType: "Comment",
              relatedEntityId: postId,
              ejsTemplatePath: ejsFile,
              receiverUsername: ((post.user as IUserDocument).authUser as IAuthUserDocument).username,
              relatedEntityType: "Post",
              entityId: doc._id.toString(),
              sendNotification: (post.user as IUserDocument).notifications.comments,
            },
            emailCommentMQ,
            GITDEV_EMAIL_COMMENT_JOB,
          );
        }
      }

      const comment = await Comment.findOne({ _id: doc._id })
        .select("content parentId user parentId createdAt")
        .populate("user", "username avatar _id");

      return comment as ICommentDocument;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async deleteComment(data: IDeleteComment): Promise<Record<string, string>> {
    const { commentId, userId, parentCommentId } = data;

    try {
      const comment = await Comment.findOne({ _id: commentId }).select("user");

      if (!comment) {
        throw new ApiError("CommentNotFound", StatusCodes.NOT_FOUND, "Comment not found");
      }

      if (comment.user.toString() !== userId) {
        throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      await Promise.all([
        Comment.deleteOne({ _id: commentId }),
        VotesComment.deleteMany({ commentId }),
        ...(parentCommentId
          ? [Comment.updateOne({ parentCommentId }, { $pull: { childrenComments: commentId } })]
          : [Comment.deleteMany({ parentCommentId: commentId })]),
      ]);

      return { commentId };
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getComments(data: IGetComments): Promise<ICommentDocument[]> {
    const { query, skip, limit, sort, userId } = data;
    try {
      const data = await Comment.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$user",
        },
        {
          $unwind: {
            path: "$votes",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "commentvotes",
            localField: "votes",
            foreignField: "_id",
            as: "votesData",
          },
        },
        {
          $unwind: {
            path: "$votesData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            content: { $first: "$content" },
            parentCommentId: { $first: "$parentCommentId" },
            user: { $first: "$user" },
            createdAt: { $first: "$createdAt" },
            votes: { $sum: "$votesData.count" },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const _votes = await VotesComment.find({ commentId: { $in: data.map((comment) => comment._id) }, user: userId });

      const comments = data.map((comment) => {
        const { ...rest } = comment;
        return {
          ...rest,
          //votesCount: votes,
          user: {
            ...comment.user,
            voted: _votes.find((vote) => vote.commentId === comment._id),
          },
        };
      });

      return comments;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async updateComment(data: IUpdateComment): Promise<ICommentDocument> {
    try {
      const { commentId, content, userId } = data;

      const { user } = (await Comment.findOne({ _id: commentId }).select("user")) as ICommentDocument;

      if (!user) {
        throw new ApiError("CommentNotFound", StatusCodes.NOT_FOUND, "Comment not found");
      }

      if (user.toString() !== userId) {
        throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      const comment = await Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }).select("content");

      if (!comment) {
        throw new ApiError("CommentNotFound", StatusCodes.NOT_FOUND, "Comment not found");
      }

      return comment;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async countComments(postId: string): Promise<number> {
    try {
      const count = await Comment.find({ postId }).countDocuments();
      return count;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async voteComment(data: IVoteComment): Promise<Record<string, boolean>> {
    const { commentId, userId, value } = data;
    try {
      const vote = await VotesComment.findOne({ commentId, user: userId });

      if (!vote) {
        const vc = await VotesComment.create({
          commentId,
          user: userId,
          count: value,
        });

        await Comment.updateOne({ _id: commentId }, { $push: { votes: vc._id } });

        return { voted: true };
      }

      if (vote.count === value) {
        await VotesComment.deleteOne({ commentId, user: userId });

        await Comment.updateOne({ _id: commentId }, { $pull: { votes: vote._id } });
        return { voted: false };
      }

      await VotesComment.updateOne({ commentId, user: userId }, { count: value });
      return { voted: true };
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
