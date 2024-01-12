import { BaseMQ } from "@config/bullmq/basemq";
import { Processor } from "bullmq";
import { IChatDeleteMessageJob, IChatMessage, IChatReaction, IChatReadMessageJob } from "../interfaces";
import {
  GITDEV_CHAT_SAVE_MESSAGE_JOB,
  GITDEV_CHAT_SAVE_MESSAGE_QUEUE,
  GITDEV_CHAT_DELETE_MESSAGE_QUEUE,
  GITDEV_CHAT_DELETE_MESSAGE_JOB,
  GITDEV_CHAT_READ_MESSAGE_JOB,
  GITDEV_CHAT_READ_MESSAGE_QUEUE,
  GITDEV_CHAT_REACTION_MESSAGE_QUEUE,
  GITDEV_CHAT_REACTION_MESSAGE_JOB,
} from "../constants";
import { ChatWorker } from "./chat-worker";

class ChatMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(
    jobName: string,
    data: IChatMessage | IChatDeleteMessageJob | IChatReadMessageJob | IChatReaction,
  ): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const chatSaveMessageMQ = new ChatMQ(
  GITDEV_CHAT_SAVE_MESSAGE_QUEUE,
  GITDEV_CHAT_SAVE_MESSAGE_JOB,
  ChatWorker.saveMessage,
);

export const chatDeleteMessageMQ = new ChatMQ(
  GITDEV_CHAT_DELETE_MESSAGE_QUEUE,
  GITDEV_CHAT_DELETE_MESSAGE_JOB,
  ChatWorker.deleteMessage,
);

export const chatReadMesssageMQ = new ChatMQ(
  GITDEV_CHAT_READ_MESSAGE_QUEUE,
  GITDEV_CHAT_READ_MESSAGE_JOB,
  ChatWorker.readMessages,
);

export const chatReactionMessageMQ = new ChatMQ(
  GITDEV_CHAT_REACTION_MESSAGE_QUEUE,
  GITDEV_CHAT_REACTION_MESSAGE_JOB,
  ChatWorker.addReaction,
);
