import { env } from "@/env";
import sendGridMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import { IMailConfig } from "./interfaces";
import { logger } from "@config/logger";
import { ApiError } from "@utils/errors/api-error";
import { GITDEV_ERRORS } from "@/constants";
import { StatusCodes } from "http-status-codes";

sendGridMail.setApiKey(env.GITDEV_SENDGRID_API_KEY);

export class Mail {
  private static async devSend(to: string, subject: string, html: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: env.GITDEV_DEV_SENDER_HOST,
      port: env.GITDEV_DEV_SENDER_HOST_PORT,
      auth: {
        user: env.GITDEV_DEV_SENDER_EMAIL,
        pass: env.GITDEV_DEV_SENDER_EMAIL_PASSWORD,
      },
    });

    const mailConfig: IMailConfig = {
      from: `GitDev <${env.GITDEV_DEV_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    };

    try {
      const info = await transporter.sendMail(mailConfig);
      logger.info(`Dev mail sent: ${info.messageId}`);
    } catch (error) {
      logger.error(`Dev mail send error: ${(error as Error).message}`, error);
      throw new ApiError(
        GITDEV_ERRORS.EMAIL_SEND_ERROR.name,
        StatusCodes.INTERNAL_SERVER_ERROR,
        (error as Error)?.message || GITDEV_ERRORS.EMAIL_SEND_ERROR.message,
      );
    }
  }
  private static async prodSend(to: string, subject: string, html: string): Promise<void> {
    const mailConfig: IMailConfig = {
      from: `GitDev <${env.GITDEV_DEV_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    };

    try {
      await sendGridMail.send(mailConfig);
      logger.info("Mail sent successfully");
    } catch (error) {
      logger.error(`[Mail - Error] :  ${(error as Error).message}`, error);
      throw new ApiError(
        GITDEV_ERRORS.EMAIL_SEND_ERROR.name,
        StatusCodes.INTERNAL_SERVER_ERROR,
        (error as Error)?.message || GITDEV_ERRORS.EMAIL_SEND_ERROR.message,
      );
    }
  }

  public static async send(to: string, subject: string, html: string): Promise<void> {
    if (env.GITDEV_SERVER_ENV === "development") {
      await Mail.devSend(to, subject, html);
    } else {
      await Mail.prodSend(to, subject, html);
    }
  }
}
