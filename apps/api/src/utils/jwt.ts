import jwt from 'jsonwebtoken';
import { Config } from '../config/env';
import { UnauthorizedError } from './error';

export interface JwtPayload {
  userId: string;
}

const config = Config.getInstance();

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt_secret, {
    expiresIn: config.jwt_expires_in as jwt.SignOptions['expiresIn']
  });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as jwt.SignOptions['expiresIn']
  });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt_refresh_secret) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};
