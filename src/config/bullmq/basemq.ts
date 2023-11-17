import { Queue, Worker, QueueEvents, Processor, WorkerOptions, Job } from "bullmq";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { logger } from "@config/logger";
import { IAuthUserJob } from "@components/auth/interfaces";
import { env } from "@/env";
import { IUserJob } from "@components/user/interfaces";

type TJobData = IAuthUserJob | IUserJob;

export abstract class BaseMQ {
  protected queue: Queue;
  private worker: Worker | undefined;
  private queueEvents: QueueEvents;
  private static queues: BullMQAdapter[] = [];
  static router: any;
  static serverAdapter: ExpressAdapter = new ExpressAdapter().setBasePath(env.GITDEV_BULLMQ_BOARD_PATH);

  private readonly REDIS_CONNECTION = {
    host: "localhost",
    port: 6379,
  };

  constructor(name: string) {
    this.queue = new Queue(name, {
      connection: this.REDIS_CONNECTION,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "fixed",
          delay: 5000,
        },
      },
    });
    this.queueEvents = new QueueEvents(name, { connection: this.REDIS_CONNECTION });
    BaseMQ.queues.push(new BullMQAdapter(this.queue));

    createBullBoard({
      queues: BaseMQ.queues,
      serverAdapter: BaseMQ.serverAdapter,
    });

    logger.info(`[BullMQ]: ${name} queue created`);

    this.queueEvents.on("completed", ({ jobId }) => {
      logger.info(`[BullMQ - ${name}]: Job with ID '${jobId}' has been successfully completed.`);
    });

    this.queueEvents.on("duplicated", ({ jobId }) => {
      logger.warn(
        `[BullMQ - ${name}]: Job with ID '${jobId}' has been detected as a duplicate. It may have been processed or enqueued previously.`,
      );
    });

    this.queueEvents.on("failed", ({ jobId, failedReason }) => {
      logger.error(`[BullMQ - ${name}]: Job with ID '${jobId}' has failed because, ${failedReason}`);
    });

    this.queueEvents.on("stalled", ({ jobId }) => {
      logger.warn(
        `[BullMQ - ${name}]: Job with ID '${jobId}' has stalled. This may indicate a processing issue or a system overload.`,
      );
    });

    this.queueEvents.on("error", (error) => {
      logger.fatal("BullMQ encountered an error", error);
    });
  }

  protected async addJob(jobName: string, data: TJobData): Promise<void> {
    const job = await this.queue.add(jobName, data);
    logger.info(`[BullMQ - ${this.queue.name}]: Job with ID '${job.id}' has been added to the queue.`);
  }

  protected processJob(jobName: string, callback: Processor, options?: WorkerOptions): void {
    this.worker = new Worker(this.queue.name, callback, { connection: this.REDIS_CONNECTION, ...options });
    logger.info(`[BullMQ - ${this.queue.name}]: Worker for job '${jobName}' has been started.`);

    this.worker.on("completed", (job: Job, result) => {
      logger.info(`[JobMQ - ${job.name}]: Completed job with data: `, {
        data: job.asJSON().data,
        id: job.id,
        result,
      });
    });

    this.worker.on("failed", (job: Job | undefined, error: Error) => {
      logger.error(`[JobMQ - ${job?.name || "Error"}]: Failed job with data: `, {
        data: job?.asJSON().data ?? "No data",
        id: job?.id ?? "No ID",
        error,
      });
    });
  }
}
