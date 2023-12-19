import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  GITDEV_COMMENT_CREATE_JOB,
  GITDEV_COMMENT_DELETE_JOB,
  GITDEV_COMMENT_PAGE_SIZE,
  GITDEV_COMMENT_UPDATE_JOB,
} from "./constants";
import { ICommentDocument } from "./interfaces";
import {
  commentSchema,
  commentSchemaParams,
  getCommentsSchema,
  deleteCommentSchemaParams,
  deleteCommentSchemaQuery,
  updateCommentSchema,
  updateCommentSchemaParams,
} from "./data/joi-schemes/comment";
import { createCommentMQ, deleteCommentMQ, updateCommentMQ } from "./bullmq/comment-mq";
import { CommentServices } from "./services";
import { Types } from "mongoose";

export class CommentControllers {
  @joiRequestValidator(commentSchema)
  @joiRequestValidator(commentSchemaParams, { params: true, body: false })
  static async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    await createCommentMQ.addJob(GITDEV_COMMENT_CREATE_JOB, {
      content,
      postId,
      userId: req.currentUser?.userId as string,
      parentCommentId,
    });

    createCommentMQ.worker?.on("completed", (_, result: ICommentDocument) => {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Comment created successfully",
        data: result,
      });
    });

    createCommentMQ.worker?.on("failed", (_, error) => {
      if (!res.headersSent) {
        next(error);
      }
    });
  }

  @joiRequestValidator(getCommentsSchema, { params: true, body: false })
  static async getComments(req: Request, res: Response): Promise<void> {
    const { postId, page } = req.params;

    const skip = (parseInt(page) - 1) * GITDEV_COMMENT_PAGE_SIZE;
    const limit = GITDEV_COMMENT_PAGE_SIZE * parseInt(page);

    const comments = await CommentServices.getComments({
      query: { postId: new Types.ObjectId(postId) },
      skip,
      limit,
      sort: { createdAt: -1 },
      userId: req.currentUser?.userId as string,
    });

    const total = await CommentServices.countComments(postId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comments fetched successfully",
      data: {
        comments,
        total,
      },
    });
  }

  @joiRequestValidator(deleteCommentSchemaParams, { body: false, params: true })
  @joiRequestValidator(deleteCommentSchemaQuery, { body: false, query: true })
  static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { commentId } = req.params;
    const { parentCommentId } = req.query as { parentCommentId?: string };

    await deleteCommentMQ.addJob(GITDEV_COMMENT_DELETE_JOB, {
      commentId,
      userId: req.currentUser?.userId as string,
      parentCommentId,
    });

    deleteCommentMQ.worker?.on("completed", (_, result: Record<string, string>) => {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Comment deleted successfully",
        data: result,
      });
    });

    deleteCommentMQ.worker?.on("failed", (_, error) => {
      if (!res.headersSent) {
        next(error);
      }
    });
  }

  @joiRequestValidator(updateCommentSchema)
  @joiRequestValidator(updateCommentSchemaParams, { params: true, body: false })
  static async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { commentId } = req.params;
    const { content } = req.body;

    await updateCommentMQ.addJob(GITDEV_COMMENT_UPDATE_JOB, {
      commentId,
      content,
      userId: req.currentUser?.userId as string,
    });

    updateCommentMQ.worker?.on("completed", (_, result: ICommentDocument) => {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Comment updated successfully",
        data: result,
      });
    });

    updateCommentMQ.worker?.on("failed", (_, error) => {
      if (!res.headersSent) {
        next(error);
      }
    });
  }
}
