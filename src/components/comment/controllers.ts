import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GITDEV_COMMENT_PAGE_SIZE } from "./constants";
import { ICreateComment, IDeleteComment, IUpdateComment, IVoteComment } from "./interfaces";
import {
  commentSchema,
  commentSchemaParams,
  getCommentsSchema,
  deleteCommentSchemaParams,
  deleteCommentSchemaQuery,
  updateCommentSchema,
  updateCommentSchemaParams,
  voteCommentSchema,
  voteCommentSchemaParams,
} from "./data/joi-schemes/comment";
import { CommentServices } from "./services";
import { Types } from "mongoose";

export class CommentControllers {
  @joiRequestValidator(commentSchema)
  @joiRequestValidator(commentSchemaParams, { params: true, body: false })
  static async createComment(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    const data: ICreateComment = {
      content,
      postId,
      userId: req.currentUser?.userId as string,
      parentCommentId,
    };

    const result = await CommentServices.createComment(data);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Comment created successfully",
      data: result,
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
  static async deleteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { parent } = req.query as { parent?: string };

    const data: IDeleteComment = {
      commentId,
      userId: req.currentUser?.userId as string,
      parentCommentId: parent,
    };

    const result = await CommentServices.deleteComment(data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  }

  @joiRequestValidator(updateCommentSchema)
  @joiRequestValidator(updateCommentSchemaParams, { params: true, body: false })
  static async updateComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { content } = req.body;

    const data: IUpdateComment = {
      commentId,
      content,
      userId: req.currentUser?.userId as string,
    };

    const result = await CommentServices.updateComment(data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment updated successfully",
      data: result,
    });
  }

  @joiRequestValidator(voteCommentSchema)
  @joiRequestValidator(voteCommentSchemaParams, { params: true, body: false })
  static async voteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { value } = req.body;

    const data: IVoteComment = {
      commentId,
      userId: req.currentUser?.userId as string,
      value,
    };

    const result = await CommentServices.voteComment(data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment voted successfully",
      data: result,
    });
  }
}
