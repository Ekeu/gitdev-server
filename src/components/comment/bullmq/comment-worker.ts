import { Job } from "bullmq";
import { CommentServices } from "../services";
import { ICommentDocument, ICreateComment, IDeleteComment, IUpdateComment, IVoteComment } from "../interfaces";

export class CommentWorker {
  static async createComment(job: Job<ICreateComment>): Promise<ICommentDocument> {
    return await CommentServices.createComment(job.data as ICreateComment);
  }

  static async deleteComment(job: Job<IDeleteComment>): Promise<Record<string, string>> {
    return await CommentServices.deleteComment(job.data as IDeleteComment);
  }

  static async updateComment(job: Job<IUpdateComment>): Promise<ICommentDocument> {
    return await CommentServices.updateComment(job.data as IUpdateComment);
  }

  static async voteComment(job: Job<IVoteComment>): Promise<Record<string, boolean>> {
    return await CommentServices.voteComment(job.data as IVoteComment);
  }
}
