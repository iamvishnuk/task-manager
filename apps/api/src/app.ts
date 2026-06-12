import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { ErrorMiddleware } from './middlewares/error.middleware';
import { NotFoundMiddleware } from './middlewares/not-found.middleware';
import { HealthRouter } from './routes/health.routes';

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
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
  }

  private registerRoutes(): void {
    const healthRouter = new HealthRouter();
    this.express.use('/api/v1/health', healthRouter.router);
  }

  private registerErrorHandlers(): void {
    this.express.use(this.notFoundMiddleware.handle);
    this.express.use(this.errorMiddleware.handle);
  }
}
