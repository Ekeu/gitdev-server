import { Job } from "bullmq";
import { PostServices } from "../services";
import { INewPost, IPostJob, INewPostJobResponse, IPostDocument } from "../interfaces";

export class PostWorker {
  static async createPost(job: Job<IPostJob>): Promise<INewPostJobResponse> {
    const post = await PostServices.createPost(job.data.value as INewPost);
    return {
      _id: post._id.toString(),
    };
  }

  static async deletePost(job: Job<IPostJob>): Promise<void> {
    await PostServices.deletePost(job.data.postId as string, job.data.userId as string);
  }

  static async updatePost(job: Job<IPostJob>): Promise<void> {
    await PostServices.updatePost(job.data.postId as string, job.data.value as IPostDocument);
  }
}
