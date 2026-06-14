import { NextFunction, Request, Response } from 'express';
import passport from '../config/passport';
import { UnauthorizedError } from '../utils/error';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: Express.User) => {
      if (err) return next(err);
      if (!user) return next(new UnauthorizedError('Unauthorized'));
      req.user = user;
      next();
    }
  )(req, res, next);
};
