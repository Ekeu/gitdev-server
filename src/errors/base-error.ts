import { StatusCodes } from "http-status-codes";

export class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: StatusCodes;
  public readonly isOperational: boolean;

  constructor(
    name: string,
    httpCode: StatusCodes,
    message: string,
    isOperational: boolean,
  ) {
    super(message);
    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
