import express from "express";
import { logger } from "./config/logger";
import { connectToDB } from "./config/db";
import mongoose from "mongoose";
import { Server } from "http";
import { createSocketIOServer } from "./socket.io";

/**
 * Class that sets up the Express server
 */

export class App {
  private app: express.Application;

  /**
   * @param port - Port number to listen on
   * @param middlewares - Array of middleware functions
   */

  constructor(
    private port: number,
    private middlewares: Array<any>,
  ) {
    this.app = express();
    this.setMiddlewares(middlewares);
  }

  /**
   * @param mdws - Array of middleware functions
   */

  private setMiddlewares(mdws: Array<any>): void {
    mdws.forEach((mdw) => {
      this.app.use(mdw);
    });
  }

  /**
   * Creates a connection to a MongoDB database
   */

  public async connectToDatabase(): Promise<void> {
    await connectToDB();
    mongoose.connection.on("disconnected", () => {
      logger.fatal("MongoDB disconnected");
    });
  }

  /**
   * Starts the server
   */

  public async listen(): Promise<void> {
    const server: Server = new Server(this.app);
    const socketIO = await createSocketIOServer(server);
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }
}
