import pino from 'pino';
import { Config } from '../config/env';

const config = Config.getInstance();

export class Logger {
  private static instance: pino.Logger;

  private static create(): pino.Logger {
    const isDev = config.isDevelopment();

    return pino({
      level: isDev ? 'debug' : 'info',
      ...(isDev && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname'
          }
        }
      })
    });
  }

  public static getInstance(): pino.Logger {
    if (!Logger.instance) {
      Logger.instance = Logger.create();
    }
    return Logger.instance;
  }
}

export const logger = Logger.getInstance();
