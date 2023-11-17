import express, { Request, Response } from "express";
import mongoose from "mongoose";
import "express-async-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "@config/logger";
import { connectToDB } from "@config/db";
import { Server } from "http";
import { createSocketIOServer, socketIOConnections } from "@config/socket";
import { initCloudinary } from "@config/cloudinary";
import { env } from "./env";
import { GITDEV_ERRORS } from "./constants";
import { BaseMQ } from "@config/bullmq/basemq";
import { initPassport } from "@config/passport";

/**
 * @description - Creates an instance of the Express app
 */

export class App {
  private app: express.Application;

  /**
   * @param port - Port number to listen on
   * @param middlewares - Array of middleware functions
   * @param routes - Array of routes
   * @param errorMiddlewares - Array of error middleware functions
   */

  constructor(
    private port: number,
    private middlewares: Array<any>,
    private routes: Array<express.Router>,
    private errorMiddlewares: Array<any>,
  ) {
    this.app = express();
    this.setMiddlewares(this.middlewares);
    initPassport(this.app);
    this.setRoutes(this.routes);
    this.app.all("*", (req: Request, res: Response) => {
      res.status(StatusCodes.NOT_FOUND).json({
        message: GITDEV_ERRORS.NOT_FOUND.message,
      });
    });
    this.setMiddlewares(this.errorMiddlewares);
  }

  /**
   * @param mdws - Array of middleware functions
   * @description - Attaches middleware functions to the Express app
   */

  private setMiddlewares(mdws: Array<any>): void {
    mdws.forEach((mdw) => {
      this.app.use(mdw);
    });
  }

  /**
   * @param routes - Array of routes
   * @description - Attaches routes to the Express app
   */

  private setRoutes(routes: Array<express.Router>) {
    this.app.use(env.GITDEV_BULLMQ_BOARD_PATH, BaseMQ.serverAdapter.getRouter());
    routes.forEach((route) => {
      this.app.use(env.GITDEV_API_BASE_PATH, route);
    });
  }

  /**
   * @description - Creates a connection to a MongoDB database
   */

  public async connectToDatabase(): Promise<void> {
    await connectToDB();
    mongoose.connection.on("disconnected", () => {
      logger.fatal("MongoDB disconnected");
    });
  }

  /**
   * @description - Starts the express and socket.io servers
   */

  public async listen(): Promise<void> {
    const server: Server = new Server(this.app);
    const socketIO = await createSocketIOServer(server);
    socketIOConnections(socketIO);
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }

  /**
   * @description - Initializes cloudinary
   */

  public initCloudinary(): void {
    initCloudinary();
  }
}
