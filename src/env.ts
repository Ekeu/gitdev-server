import "dotenv/config";
import _ from "lodash";

class Environment {
  public GITDEV_MONGO_DB: string;
  public GITDEV_MONGO_URL: string;
  public GITDEV_MONGO_USER: string;
  public GITDEV_SERVER_ENV: string;
  public GITDEV_CLIENT_URL: string;
  public GITDEV_REDIS_HOST: string;
  public GITDEV_JWT_SECRET: string;
  public GITDEV_SERVER_PORT: number;
  public GITDEV_MONGO_CLUSTER: string;
  public GITDEV_API_BASE_PATH: string;
  public GITDEV_SESSION_SECRET: string;
  public GITDEV_MONGO_PASSWORD: string;
  public GITDEV_AUTH_SALT_ROUNDS: number;
  public GITDEV_GOOGLE_CLIENT_ID: string;
  public GITDEV_GITHUB_CLIENT_ID: string;
  public GITDEV_BULLMQ_BOARD_PATH: string;
  public GITDEV_REFRESH_JWT_SECRET: string;
  public GITDEV_CLOUDINARY_API_KEY: string;
  public GITDEV_GOOGLE_CALLBACK_URL: string;
  public GITDEV_GITHUB_CALLBACK_URL: string;
  public GITDEV_GOOGLE_CLIENT_SECRET: string;
  public GITDEV_GITHUB_CLIENT_SECRET: string;
  public GITDEV_JWT_SECRET_EXPIRES_IN: string;
  public GITDEV_CLOUDINARY_CLOUD_NAME: string;
  public GITDEV_CLOUDINARY_API_SECRET: string;
  public GITDEV_DEV_SENDER_HOST: string;
  public GITDEV_DEV_SENDER_EMAIL: string;
  public GITDEV_DEV_SENDER_EMAIL_PASSWORD: string;
  public GITDEV_SENDGRID_API_KEY: string;
  public GITDEV_DEV_SENDER_HOST_PORT: number;
  public GITDEV_EMAIL_VERIFICATION_SPEAKEASY_STEPS: number;
  public GITDEV_SENDGRID_SENDER: string;
  public GITDEV_REFRESH_JWT_SECRET_EXPIRES_IN: string;
  public GITDEV_RESET_PASSWORD_JWT_SECRET_EXPIRES_MINS: string;

  constructor() {
    this.GITDEV_MONGO_DB = process.env.GITDEV_MONGO_DB || "";
    this.GITDEV_MONGO_USER = process.env.GITDEV_MONGO_USER || "";
    this.GITDEV_JWT_SECRET = process.env.GITDEV_JWT_SECRET || "";
    this.GITDEV_SERVER_ENV = process.env.GITDEV_SERVER_ENV || "";
    this.GITDEV_CLIENT_URL = process.env.GITDEV_CLIENT_URL || "";
    this.GITDEV_REDIS_HOST = process.env.GITDEV_REDIS_HOST || "";
    this.GITDEV_API_BASE_PATH = process.env.GITDEV_API_BASE_PATH || "";
    this.GITDEV_MONGO_CLUSTER = process.env.GITDEV_MONGO_CLUSTER || "";
    this.GITDEV_SESSION_SECRET = process.env.GITDEV_SESSION_SECRET || "";
    this.GITDEV_MONGO_PASSWORD = process.env.GITDEV_MONGO_PASSWORD || "";
    this.GITDEV_DEV_SENDER_HOST = process.env.GITDEV_DEV_SENDER_HOST || "";
    this.GITDEV_SENDGRID_SENDER = process.env.GITDEV_SENDGRID_SENDER || "";
    this.GITDEV_DEV_SENDER_EMAIL = process.env.GITDEV_DEV_SENDER_EMAIL || "";
    this.GITDEV_SENDGRID_API_KEY = process.env.GITDEV_SENDGRID_API_KEY || "";
    this.GITDEV_GITHUB_CLIENT_ID = process.env.GITDEV_GITHUB_CLIENT_ID || "";
    this.GITDEV_GOOGLE_CLIENT_ID = process.env.GITDEV_GOOGLE_CLIENT_ID || "";
    this.GITDEV_SERVER_PORT = Number(process.env.GITDEV_SERVER_PORT) || 9600;
    this.GITDEV_BULLMQ_BOARD_PATH = process.env.GITDEV_BULLMQ_BOARD_PATH || "";
    this.GITDEV_REFRESH_JWT_SECRET = process.env.GITDEV_REFRESH_JWT_SECRET || "";
    this.GITDEV_CLOUDINARY_API_KEY = process.env.GITDEV_CLOUDINARY_API_KEY || "";
    this.GITDEV_GOOGLE_CALLBACK_URL = process.env.GITDEV_GOOGLE_CALLBACK_URL || "";
    this.GITDEV_GITHUB_CALLBACK_URL = process.env.GITDEV_GITHUB_CALLBACK_URL || "";
    this.GITDEV_GOOGLE_CLIENT_SECRET = process.env.GITDEV_GOOGLE_CLIENT_SECRET || "";
    this.GITDEV_GITHUB_CLIENT_SECRET = process.env.GITDEV_GITHUB_CLIENT_SECRET || "";
    this.GITDEV_AUTH_SALT_ROUNDS = Number(process.env.GITDEV_AUTH_SALT_ROUNDS) || 10;
    this.GITDEV_EMAIL_VERIFICATION_SPEAKEASY_STEPS =
      Number(process.env.GITDEV_EMAIL_VERIFICATION_SPEAKEASY_STEPS) || 30;
    this.GITDEV_JWT_SECRET_EXPIRES_IN = process.env.GITDEV_JWT_SECRET_EXPIRES_IN || "";
    this.GITDEV_CLOUDINARY_CLOUD_NAME = process.env.GITDEV_CLOUDINARY_CLOUD_NAME || "";
    this.GITDEV_CLOUDINARY_API_SECRET = process.env.GITDEV_CLOUDINARY_API_SECRET || "";
    this.GITDEV_DEV_SENDER_HOST_PORT = Number(process.env.GITDEV_DEV_SENDER_HOST_PORT) || 587;
    this.GITDEV_DEV_SENDER_EMAIL_PASSWORD = process.env.GITDEV_DEV_SENDER_EMAIL_PASSWORD || "";
    this.GITDEV_REFRESH_JWT_SECRET_EXPIRES_IN = process.env.GITDEV_REFRESH_JWT_SECRET_EXPIRES_IN || "";
    this.GITDEV_RESET_PASSWORD_JWT_SECRET_EXPIRES_MINS =
      process.env.GITDEV_RESET_PASSWORD_JWT_SECRET_EXPIRES_MINS || "";
    this.GITDEV_MONGO_URL = `mongodb+srv://${process.env.GITDEV_MONGO_USER}:${process.env.GITDEV_MONGO_PASSWORD}@${process.env.GITDEV_MONGO_CLUSTER}.ziu6aw8.mongodb.net/?retryWrites=true&w=majority`;
  }

  public validateEnvs(): void {
    const envs = _.entries(this);
    envs.forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    });
  }
}

export const env = new Environment();
