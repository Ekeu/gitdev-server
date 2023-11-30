import { Mail } from "@config/mail/mail";
import { IEmailJob } from "../interfaces";
import { Job } from "bullmq";

export class MailWorker {
  static async sendEmail(job: Job<IEmailJob>): Promise<{ success: boolean }> {
    const { to, subject, html } = job.data.value;
    await Mail.send(to, subject, html);
    return {
      success: true,
    };
  }
}
