import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@/utils/errors/error-handler";
import { logger } from "@config/logger";
import { BaseError } from "@/utils/errors/base-error";
import { env } from "@/env";

export const errorMiddlewares = [
  (error: Error, _req: Request, res: Response, next: NextFunction) => {
    if (!errorHandler.isTrustedError(error)) {
      next(error);
    }
    errorHandler.handleError(error as BaseError, res);
  },
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
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
