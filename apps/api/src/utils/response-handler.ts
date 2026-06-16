import { Response } from 'express';
import { HttpResponseCode, HttpStatus } from '../config/http';
import { Config } from '../config/env';
import { calculateExpirationDate } from './date-time';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    statusCode: HttpResponseCode = HttpStatus.OK,
    message: string = 'Success'
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(
    res: Response,
    error: Error,
    statusCode: HttpResponseCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = error.message
  ) {
    const config = Config.getInstance();

    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      ...(config.isDevelopment() && { stack: error.stack })
    });
  }

  static authSuccess<T>(
    res: Response,
    data: T,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    statusCode: HttpResponseCode = HttpStatus.OK,
    message: string = 'Authentication successful'
  ) {
    const config = Config.getInstance();

    const cookieOptions: any = {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite
    };

    if (config.cookieDomain) {
      cookieOptions.domain = config.cookieDomain;
    }

    if (accessToken) {
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        expires: calculateExpirationDate(config.jwt_expires_in)
      });
    }

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: calculateExpirationDate(config.jwt_refresh_expires_in),
        path: `${config.apiPrefix}/auth/refresh`
      });
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static clearCookies(
    res: Response,
    statusCode: HttpResponseCode = HttpStatus.OK,
    message: string = 'Cookies cleared'
  ) {
    const config = Config.getInstance();

    const cookieOptions: any = {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite
    };

    if (config.cookieDomain) {
      cookieOptions.domain = config.cookieDomain;
    }

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', {
      ...cookieOptions,
      path: `${config.apiPrefix}/auth/refresh`
    });

    return res.status(statusCode).json({
      success: true,
      message,
      data: null
    });
  }
}
