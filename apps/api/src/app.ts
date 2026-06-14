import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import './config/passport';
import passport from 'passport';
import { ErrorMiddleware } from './middlewares/error.middleware';
import { NotFoundMiddleware } from './middlewares/not-found.middleware';
import { AuthRouter } from './routes/auth.routes';
import { HealthRouter } from './routes/health.routes';
import { TaskRouter } from './routes/task.routes';
import { Config } from './config/env';

export class App {
  public readonly express: Application;

  private readonly errorMiddleware: ErrorMiddleware;
  private readonly notFoundMiddleware: NotFoundMiddleware;

  constructor() {
    this.express = express();
    this.errorMiddleware = new ErrorMiddleware();
    this.notFoundMiddleware = new NotFoundMiddleware();
    this.registerGlobalMiddleware();
    this.registerRoutes();
    this.registerErrorHandlers();
  }

  private registerGlobalMiddleware(): void {
    this.express.use(helmet());
    this.express.use(
      cors({
        origin: Config.getInstance().appOrigin,
        credentials: true
      })
    );
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cookieParser());
    this.express.use(passport.initialize());
    Config.getInstance().isDevelopment()
      ? this.express.use(morgan('dev'))
      : this.express.use(morgan('combined'));
  }

  private registerRoutes(): void {
    const healthRouter = new HealthRouter();
    const authRouter = new AuthRouter();
    const taskRouter = new TaskRouter();

    this.express.use('/api/v1/health', healthRouter.router);
    this.express.use('/api/v1/auth', authRouter.router);
    this.express.use('/api/v1/tasks', taskRouter.router);
  }

  private registerErrorHandlers(): void {
    this.express.use(this.notFoundMiddleware.handle);
    this.express.use(this.errorMiddleware.handle);
  }
}
