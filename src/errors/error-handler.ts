import { Response } from "express";
import { logger } from "src/config/logger";
import { BaseError } from "./base-error";

class ErrorHandler {
  public handleError(err: BaseError, res: Response): void {
    logger.warn("An operational error has occurred: ", err);
    res.status(err.httpCode).json({
      message: err.message,
    });
  }

  public isTrustedError(err: Error): boolean {
    if (err instanceof BaseError) {
      return err.isOperational;
    }

    return false;
  }
}

export const errorHandler = new ErrorHandler();
