import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { reactionSchema } from "./data/joi-schemes/reaction";
import { Request, Response } from "express";
import { reactionCache } from "./redis/cache/reaction";
import { StatusCodes } from "http-status-codes";
import { createReactionMQ, deleteReactionMQ } from "./bullmq/reaction-mq";
import { GITDEV_REACTION_CREATE_JOB, GITDEV_REACTION_DELETE_JOB } from "./constants";
import { IReactionDocument } from "./interfaces";
import { UserServices } from "@components/user/services";
import { IUserDocument } from "@components/user/interfaces";
import { ReactionServices } from "./services";
import { Types } from "mongoose";

export class ReactionControllers {
  @joiRequestValidator(reactionSchema)
  static async createReaction(req: Request, res: Response) {
    const { postId, type } = req.body;

    const data = {
      type,
      postId,
      user: req.currentUser?.userId as string,
    };

    await reactionCache.save(postId, data, type);

    createReactionMQ.addJob(GITDEV_REACTION_CREATE_JOB, {
      type,
      postId,
      value: data,
      userId: req.currentUser?.userId as string,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Reaction added successfully",
    });
  }

  static async deleteReaction(req: Request, res: Response) {
    const { postId, type } = req.params;

    await reactionCache.delete(postId, req.currentUser?.userId as string, type);

    deleteReactionMQ.addJob(GITDEV_REACTION_DELETE_JOB, { postId, userId: req.currentUser?.userId as string, type });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Reaction deleted successfully",
    });
  }

  static async getPostReactions(req: Request, res: Response) {
    const { postId } = req.params;

    let reactions: IReactionDocument[] = [];
    let total: number = 0;

    const data = await reactionCache.get(postId);

    if (data.total) {
      reactions = data.reactions;
      total = data.total;

      for (let index = 0; index < reactions.length; index++) {
        const user = await UserServices.getAuthLookUpData(
          reactions[index].user.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        reactions[index].user = user as IUserDocument;
      }
    } else {
      const data = await ReactionServices.getPostReactions({ postId: new Types.ObjectId(postId) }, { createdAt: -1 });
      reactions = data.reactions;
      total = data.total;
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Reactions retrieved successfully",
      data: {
        reactions,
        total,
      },
    });
  }

  static async getReactionsByUser(req: Request, res: Response) {
    const { userId } = req.params;

    let reactions: IReactionDocument[] = [];
    let total: number = 0;

    const data = await reactionCache.getReactionsByUser(userId);

    if (data.total) {
      reactions = data.reactions;
      total = data.total;

      for (let index = 0; index < reactions.length; index++) {
        const user = await UserServices.getAuthLookUpData(
          reactions[index].user.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        reactions[index].user = user as IUserDocument;
      }
    } else {
      const data = await ReactionServices.getReactionsByUser(userId);
      reactions = data.reactions;
      total = data.total;
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Reactions retrieved successfully",
      data: {
        reactions,
        total,
      },
    });
  }

  static async getPostReactionByUser(req: Request, res: Response) {
    const { postId, userId } = req.params;

    let reaction: IReactionDocument | null = null;

    reaction = await reactionCache.getPostReactionByUser(postId, userId);

    if (!reaction) {
      reaction = await ReactionServices.getPostReactionByUser(postId, userId);
    }

    if (!reaction) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "No reaction found",
        data: null,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Reaction retrieved successfully",
      data: {
        reaction,
      },
    });
  }
}
