import { BaseMQ } from "@config/bullmq/basemq";
import {
  GITDEV_COMMENT_CREATE_JOB,
  GITDEV_COMMENT_CREATE_QUEUE,
  GITDEV_COMMENT_DELETE_JOB,
  GITDEV_COMMENT_DELETE_QUEUE,
  GITDEV_COMMENT_UPDATE_JOB,
  GITDEV_COMMENT_UPDATE_QUEUE,
} from "../constants";
import { ICreateComment, IDeleteComment, IUpdateComment } from "../interfaces";
import { CommentWorker } from "./comment-worker";

class CreateCommentMQ extends BaseMQ {
  constructor() {
    super(GITDEV_COMMENT_CREATE_QUEUE);
    this.processJob(GITDEV_COMMENT_CREATE_JOB, CommentWorker.createComment, { concurrency: 5 });
  }

  async addJob(jobName: string, data: ICreateComment): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

class DeleteCommentMQ extends BaseMQ {
  constructor() {
    super(GITDEV_COMMENT_DELETE_QUEUE);
    this.processJob(GITDEV_COMMENT_DELETE_JOB, CommentWorker.deleteComment, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IDeleteComment): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

class UpdateCommentMQ extends BaseMQ {
  constructor() {
    super(GITDEV_COMMENT_UPDATE_QUEUE);
    this.processJob(GITDEV_COMMENT_UPDATE_JOB, CommentWorker.updateComment, { concurrency: 5 });
  }

  async addJob(jobName: string, data: IUpdateComment): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const createCommentMQ = new CreateCommentMQ();
export const deleteCommentMQ = new DeleteCommentMQ();
export const updateCommentMQ = new UpdateCommentMQ();
