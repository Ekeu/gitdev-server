import { Post } from "@components/post/data/models/post";
import { Reaction } from "./data/models/reaction";
import { IReactionDocument, IReactionJob, IReactionQuery } from "./interfaces";
import { ApiError } from "@utils/errors/api-error";
import { GITDEV_ERRORS } from "./constants";
import { StatusCodes } from "http-status-codes";
import { getUserAuthLookup } from "@utils/common";
import path from "path";
import { UserServices } from "@components/user/services";
import { PostServices } from "@components/post/services";
import { env } from "@/env";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { NotificationServices } from "@components/notification/services";
import { IUserDocument } from "@components/user/interfaces";
import { emailReactionMQ } from "@components/mail/bullmq/mail-mq";
import { GITDEV_EMAIL_REACTION_JOB } from "@components/mail/constants";

export class ReactionServices {
  static async createReaction(data: IReactionJob): Promise<void> {
    const { postId, userId, type, value: reaction } = data;

    const reactionDoc = await Reaction.findOne({ postId, user: userId });

    const previousReactionType = reactionDoc ? reactionDoc.type : "";

    const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "notification.ejs");

    const [sender, _reaction, post] = await Promise.all([
      UserServices.getAuthLookUpData(userId, ["username"]),
      Reaction.findOneAndReplace({ postId, user: userId }, reaction, { upsert: true, returnOriginal: false }),
      PostServices.findPostById(postId, {
        authUser: { fields: ["email", "username"] },
        user: { fields: ["notifications"] },
      }),
      Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            ...(previousReactionType ? { [`reactions.${previousReactionType}`]: -1 } : {}),
            [`reactions.${type}`]: 1,
          },
        },
        { new: true },
      ),
    ]);

    const notificationLink = `${env.GITDEV_CLIENT_URL}/posts/${postId}`;
    const message = `${(sender!.authUser as IAuthUserDocument)!.username} reacted to your post`;

    NotificationServices.createAndSendNotification(
      {
        message,
        notificationLink,
        senderId: userId,
        entityType: "Reaction",
        receiverId: (post!.user as IUserDocument)._id.toString(),
        ejsTemplatePath: ejsFile,
        relatedEntityId: postId,
        relatedEntityType: "Post",
        entityId: _reaction!._id.toString(),
        sendNotification: (post!.user as IUserDocument).notifications.reactions,
        receiverEmail: (post!.authUser as IAuthUserDocument).email,
        receiverUsername: (post!.authUser as IAuthUserDocument).username,
      },
      emailReactionMQ,
      GITDEV_EMAIL_REACTION_JOB,
    );
  }

  static async deleteReaction(data: IReactionJob): Promise<void> {
    const { postId, userId, type } = data;

    const reactionDoc = await Reaction.findOne({ postId, user: userId });

    if (!reactionDoc) {
      throw new ApiError(
        GITDEV_ERRORS.REACTION_NOT_FOUND.name,
        StatusCodes.NOT_FOUND,
        GITDEV_ERRORS.REACTION_NOT_FOUND.message,
      );
    }

    const reactionType = reactionDoc ? reactionDoc.type : "";

    if (!reactionType) {
      throw new ApiError(
        GITDEV_ERRORS.REACTION_TYPE_NOT_FOUND.name,
        StatusCodes.NOT_FOUND,
        GITDEV_ERRORS.REACTION_TYPE_NOT_FOUND.message,
      );
    }

    if (reactionType !== type) {
      throw new ApiError(
        GITDEV_ERRORS.REACTION_TYPE_MISMATCH.name,
        StatusCodes.BAD_REQUEST,
        GITDEV_ERRORS.REACTION_TYPE_MISMATCH.name,
      );
    }

    await Promise.all([
      Reaction.deleteOne({ postId, user: userId }),
      Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${reactionType}`]: -1,
          },
        },
      ),
    ]);
  }

  static async getPostReactions(
    query: IReactionQuery,
    sort: Record<string, 1 | -1>,
  ): Promise<{ reactions: IReactionDocument[]; total: number }> {
    const reactions = await Reaction.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $sort: sort,
      },
      getUserAuthLookup(),
      {
        $unwind: "$user",
      },
    ]);

    const total = await Reaction.countDocuments(query);

    return { reactions, total };
  }

  static async getPostReactionByUser(postId: string, userId: string): Promise<IReactionDocument | null> {
    const reaction = await Reaction.findOne({ postId, user: userId });
    return reaction;
  }

  static async getReactionsByUser(userId: string): Promise<{ reactions: IReactionDocument[]; total: number }> {
    const reactions = await Reaction.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      getUserAuthLookup(),
      {
        $unwind: "$user",
      },
    ]);

    const total = await Reaction.countDocuments({ user: userId });

    return { reactions, total };
  }
}
