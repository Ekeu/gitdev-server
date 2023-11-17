import { Job } from "bullmq";
import { IAuthUserJob, IAuthUserJobResponse, ISignUp } from "../interfaces";
import { AuthUserServices } from "../services";

export class AuthWorker {
  static async createAuthUser(job: Job<IAuthUserJob>): Promise<IAuthUserJobResponse> {
    const user = await AuthUserServices.createAuthUser(job.data.value as ISignUp);
    return {
      _id: user._id.toString(),
      username: user.username,
    };
  }
}
