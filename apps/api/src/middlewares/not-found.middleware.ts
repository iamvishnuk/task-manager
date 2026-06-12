import { Request, Response } from 'express';
import { HttpStatus } from '../config/http';
import { ResponseHandler } from '../utils/response-handler';

export class NotFoundMiddleware {
  public handle(_req: Request, res: Response): void {
    const error = new Error(
      `Route ${_req.method} ${_req.originalUrl} not found`
    );
    ResponseHandler.error(res, error, HttpStatus.NOT_FOUND);
  }
}
