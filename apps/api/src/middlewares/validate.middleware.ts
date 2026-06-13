import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BadRequestError } from '../utils/error';

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`)
    .join(', ');

export const validateRequest =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new BadRequestError(formatZodError(result.error)));
    }
    req.body = result.data as z.infer<T>;
    next();
  };

export const validateParams =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new BadRequestError(formatZodError(result.error)));
    }
    req.params = result.data as Record<string, string>;
    next();
  };

export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new BadRequestError(formatZodError(result.error)));
    }
    req.query = result.data as Record<string, string>;
    next();
  };
