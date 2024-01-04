import { Job } from "bullmq";
import { FollowServices } from "../services";
import { IFollowJob, INewFollow, INewFollowJobResponse } from "../interfaces";

export class FollowWorker {
  static async follow(job: Job<IFollowJob>): Promise<INewFollowJobResponse> {
    const res = await FollowServices.follow(job.data.value as INewFollow);
    return {
      _id: res._id.toString(),
    };
  }

  static async unfollow(job: Job<IFollowJob>): Promise<void> {
    await FollowServices.unfollow(job.data.follower as string, job.data.following as string);
  }
}
