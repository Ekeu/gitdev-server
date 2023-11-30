import { Request, Response, NextFunction } from "express";
import { errorHandler } from "@/utils/errors/error-handler";
import { logger } from "@config/logger";
import { BaseError } from "@/utils/errors/base-error";
import { env } from "@/env";
import { StatusCodes } from "http-status-codes";

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
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        stack: error.stack,
        success: false,
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      success: false,
    });
  },
];
