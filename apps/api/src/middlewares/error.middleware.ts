import { Request, Response, NextFunction } from 'express';
import { HttpResponseCode, HttpStatus } from '../config/http';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';
import { ResponseHandler } from '../utils/response-handler';

export class ErrorMiddleware {
  public handle(
    err: AppError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    const statusCode =
      err instanceof AppError
        ? (err.statusCode as HttpResponseCode)
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      err instanceof AppError && err.isOperational
        ? err.message
        : 'Internal Server Error';

    logger.error({ statusCode, err: err.message }, 'Request error');

    ResponseHandler.error(res, err, statusCode, message);
  }
}
