import { BaseMQ } from "@config/bullmq/basemq";
import {
  INotificationSettingsJob,
  IUserAvatarJob,
  IUserBasicInfoJob,
  IUserBlockListJob,
  IUserJob,
} from "../interfaces";
import { UserWorker } from "./user-worker";
import {
  GITDEV_USER_BLOCK_LIST_QUEUE,
  GITDEV_USER_QUEUE,
  GITDEV_USER_SIGNUP_JOB,
  GITDEV_USER_BLOCK_LIST_JOB,
  GITDEV_USER_AVATAR_QUEUE,
  GITDEV_USER_AVATAR_JOB,
  GITDEV_USER_BASIC_INFO_UPDATE_QUEUE,
  GITDEV_USER_BASIC_INFO_UPDATE_JOB,
  GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_QUEUE,
  GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_JOB,
} from "../constants";
import { Processor } from "bullmq";

type TUserJob = IUserJob | IUserBlockListJob | IUserAvatarJob | IUserBasicInfoJob | INotificationSettingsJob;

class UserMQ extends BaseMQ {
  constructor(queueName: string, jobName: string, callback: Processor) {
    super(queueName);
    this.processJob(jobName, callback, { concurrency: 5 });
  }

  async addJob(jobName: string, data: TUserJob): Promise<void> {
    await this.queue.add(jobName, data);
  }
}

export const userMQ = new UserMQ(GITDEV_USER_QUEUE, GITDEV_USER_SIGNUP_JOB, UserWorker.createUser);
export const updateUserBlockListMQ = new UserMQ(
  GITDEV_USER_BLOCK_LIST_QUEUE,
  GITDEV_USER_BLOCK_LIST_JOB,
  UserWorker.updateUserBlockList,
);
export const updateUserAvatarMQ = new UserMQ(GITDEV_USER_AVATAR_QUEUE, GITDEV_USER_AVATAR_JOB, UserWorker.updateAvatar);

export const updateUserBasicInfoMQ = new UserMQ(
  GITDEV_USER_BASIC_INFO_UPDATE_QUEUE,
  GITDEV_USER_BASIC_INFO_UPDATE_JOB,
  UserWorker.updateBasicInfo,
);

export const updateNotificationSettingsMQ = new UserMQ(
  GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_QUEUE,
  GITDEV_USER_NOTIFICATION_SETTINGS_UPDATE_JOB,
  UserWorker.updateNotificationSettings,
);
