import { Job } from "bullmq";
import { IReactionJob } from "../interfaces";
import { ReactionServices } from "../services";

export class ReactionWorker {
  static async createReaction(job: Job<IReactionJob>): Promise<void> {
    await ReactionServices.createReaction(job.data as IReactionJob);
  }

  static async deleteReaction(job: Job<IReactionJob>): Promise<void> {
    await ReactionServices.deleteReaction(job.data as IReactionJob);
  }
}
