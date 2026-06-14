import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Config } from './env';
import { db } from '../db/index';
import { users } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { UnauthorizedError } from '../utils/error';
import type { JwtPayload } from '../utils/jwt';

const config = Config.getInstance();

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['accessToken'] as string | null;
          }
          return token;
        }
      ]),
      secretOrKey: config.jwt_secret
    },
    async (payload: JwtPayload, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId))
          .limit(1);

        if (!user) {
          return done(new UnauthorizedError('User not found'), false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
