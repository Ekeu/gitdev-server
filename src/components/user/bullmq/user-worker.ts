import { Job } from "bullmq";
import { IUserAvatarJob, IUserBlockListJob, IUserDocument, IUserJob, IUserJobResponse } from "../interfaces";
import { UserServices } from "../services";

export class UserWorker {
  static async createUser(job: Job<IUserJob>): Promise<IUserJobResponse> {
    const user = await UserServices.createUser(job.data.value as IUserDocument);
    return {
      _id: user._id.toString(),
    };
  }

  static async updateUserBlockList(job: Job<IUserBlockListJob>): Promise<void> {
    const { userId, blockedUserId, action } = job.data;
    await UserServices.updateUserBlockList(userId, blockedUserId, action);
  }

  static async updateAvatar(job: Job<IUserAvatarJob>): Promise<void> {
    const { userId, avatar } = job.data;
    await UserServices.updateAvatar(userId, avatar);
  }
}
