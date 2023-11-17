import { Job } from "bullmq";
import { IUserDocument, IUserJob, IUserJobResponse } from "../interfaces";
import { UserServices } from "../services";

export class UserWorker {
  static async createUser(job: Job<IUserJob>): Promise<IUserJobResponse> {
    const user = await UserServices.createUser(job.data.value as IUserDocument);
    return {
      _id: user._id.toString(),
    };
  }
}
