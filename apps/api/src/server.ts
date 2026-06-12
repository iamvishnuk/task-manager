import { App } from './app';
import { Config } from './config/env';
import { logger } from './utils/logger';

class Server {
  private readonly app: App;
  private readonly config: Config;

  constructor() {
    this.app = new App();
    this.config = Config.getInstance();
  }

  public start(): void {
    const { port, nodeEnv } = this.config;

    this.app.express.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`📦 Environment: ${nodeEnv}`);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, 'Unhandled Rejection');
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ err: error.message }, 'Uncaught Exception');
      process.exit(1);
    });
  }
}

const server = new Server();
server.start();
