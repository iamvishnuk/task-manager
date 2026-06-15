import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { sessions, users } from '../db/schema/index';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../utils/error';
import { Config } from '../config/env';
import type {
  TLoginSchema,
  TRegisterSchema
} from '@task-manager/shared/schemas/user';

const SALT_ROUNDS = 10;

const getRefreshTokenExpiry = (): Date => {
  const config = Config.getInstance();
  const expiresIn = config.jwt_refresh_expires_in;
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');

  const [, value, unit] = match;
  const ms: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };
  return new Date(Date.now() + Number(value) * (ms[unit as string] ?? 0));
};

export class AuthService {
  async signup(data: TRegisterSchema) {
    // Check email uniqueness
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({ name: data.name, email: data.email, password: passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      });

    if (!user) throw new Error('Failed to create user');

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokenHash,
      expiresAt: getRefreshTokenExpiry()
    });

    return { accessToken, refreshToken, user };
  }

  async login(data: TLoginSchema) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokenHash,
      expiresAt: getRefreshTokenExpiry()
    });

    const { password: _, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    // Find all sessions for this user and check which one matches
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, payload.userId));

    let matchedSession = null;
    for (const session of userSessions) {
      const isMatch = await bcrypt.compare(token, session.refreshToken);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession || matchedSession.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Rotate — delete old session, create new one
    await db.delete(sessions).where(eq(sessions.id, matchedSession.id));

    const accessToken = signAccessToken({ userId: payload.userId });
    const newRefreshToken = signRefreshToken({ userId: payload.userId });

    const tokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await db.insert(sessions).values({
      userId: payload.userId,
      refreshToken: tokenHash,
      expiresAt: getRefreshTokenExpiry()
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}
