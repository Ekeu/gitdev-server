import { Job } from "bullmq";
import { IChatDeleteMessageJob, IChatMessage, IChatReaction, IChatReadMessageJob } from "../interfaces";
import { ChatServices } from "../services";
("../interfaces");

export class ChatWorker {
  static async saveMessage(job: Job<IChatMessage>): Promise<void> {
    await ChatServices.saveMessage(job.data);
  }

  static async deleteMessage(job: Job<IChatDeleteMessageJob>): Promise<void> {
    await ChatServices.deleteMessage(job.data.messageId, job.data.deletionType);
  }

  static async readMessages(job: Job<IChatReadMessageJob>): Promise<void> {
    await ChatServices.readMeassages(job.data.from, job.data.to);
  }

  static async addReaction(job: Job<IChatReaction>): Promise<void> {
    await ChatServices.addReaction(job.data.messageId, job.data.from, job.data.reaction);
  }
}
