import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../utils/response-handler';
import { HttpStatus } from '../config/http';
import { BadRequestError } from '../utils/error';
import type { User } from '../db/schema/index';
import type {
  TLoginSchema,
  TRegisterSchema
} from '@task-manager/shared/schemas/user';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user } = await authService.signup(
        req.body as TRegisterSchema
      );
      ResponseHandler.authSuccess(
        res,
        user,
        accessToken,
        refreshToken,
        HttpStatus.CREATED,
        'Account created successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user } = await authService.login(
        req.body as TLoginSchema
      );
      ResponseHandler.authSuccess(
        res,
        user,
        accessToken,
        refreshToken,
        HttpStatus.OK,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken as string | undefined;
      if (!token) {
        throw new BadRequestError('Refresh token not provided');
      }
      const { accessToken, refreshToken } =
        await authService.refreshToken(token);
      ResponseHandler.authSuccess(
        res,
        null,
        accessToken,
        refreshToken,
        HttpStatus.OK,
        'Token refreshed'
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      await authService.logout(user.id);
      ResponseHandler.clearCookies(
        res,
        HttpStatus.OK,
        'Logged out successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { password: _, ...safeUser } = user;
      ResponseHandler.success(
        res,
        safeUser,
        HttpStatus.OK,
        'Profile retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
