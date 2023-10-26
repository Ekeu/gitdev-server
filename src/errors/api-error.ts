import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { BaseError } from "./base-error";

export class ApiError extends BaseError {
  constructor(
    name: string,
    httpCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message = getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    isOperational = true,
  ) {
    super(name, httpCode, message, isOperational);
  }
}
