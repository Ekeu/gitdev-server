import "dotenv/config";

class Environment {
  public GITDEV_SERVER_PORT: number;
  public GITDEV_MONGO_PASSWORD: string;
  public GITDEV_MONGO_USER: string;
  public GITDEV_MONGO_CLUSTER: string;
  public GITDEV_MONGO_DB: string;
  public GITDEV_MONGO_URL: string;
  public GITDEV_SERVER_ENV: string;
  public GITDEV_CLIENT_URL: string;
  public GITDEV_REDIS_HOST: string;

  constructor() {
    this.GITDEV_SERVER_PORT = Number(process.env.GITDEV_SERVER_PORT) || 9600;
    this.GITDEV_MONGO_PASSWORD = process.env.GITDEV_MONGO_PASSWORD || "";
    this.GITDEV_MONGO_USER = process.env.GITDEV_MONGO_USER || "";
    this.GITDEV_MONGO_CLUSTER = process.env.GITDEV_MONGO_CLUSTER || "";
    this.GITDEV_MONGO_DB = process.env.GITDEV_MONGO_DB || "";
    this.GITDEV_SERVER_ENV = process.env.GITDEV_SERVER_ENV || "";
    this.GITDEV_CLIENT_URL = process.env.GITDEV_CLIENT_URL || "";
    this.GITDEV_REDIS_HOST = process.env.GITDEV_REDIS_HOST || "";
    this.GITDEV_MONGO_URL = `mongodb+srv://${process.env.GITDEV_MONGO_USER}:${process.env.GITDEV_MONGO_PASSWORD}@${process.env.GITDEV_MONGO_CLUSTER}.ziu6aw8.mongodb.net/?retryWrites=true&w=majority`;
  }

  public validateEnvs(): void {
    const envs = Object.entries(this);
    envs.forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    });
  }
}

export const env = new Environment();
