import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";
import { errorHandler } from "./errors/error-handler";
import { logger } from "./config/logger";
import { BaseError } from "./errors/base-error";
import { env } from "./env";

export const middlewares = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "res.cloudinary.com"],
        "font-src": ["'self'"],
        "connect-src": ["'self'"],
        "object-src": ["'self'"],
        "frame-src": ["'self'"],
      },
    },
  }),
  hpp(),
  cors({
    origin: env.GITDEV_CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  express.json(),
  morgan("combined"),
  compression(),
  express.urlencoded({ extended: true }),
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (!errorHandler.isTrustedError(error)) {
      next(error);
    }
    errorHandler.handleError(error as BaseError, res);
  },
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("An unexpected error has occurred: ", error);
    if (env.GITDEV_SERVER_ENV === "development") {
      return res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  },
];
