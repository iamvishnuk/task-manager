export class Config {
  private static instance: Config;

  public readonly port: number;
  public readonly nodeEnv: string;

  public readonly appOrigin: string;
  public readonly apiPrefix: string;

  public readonly jwt_secret: string;
  public readonly jwt_expires_in: string;
  public readonly jwt_refresh_secret: string;
  public readonly jwt_refresh_expires_in: string;

  private constructor() {
    this.port = Number(process.env.PORT ?? 8000);
    this.nodeEnv = process.env.NODE_ENV ?? 'development';

    this.appOrigin = process.env.APP_ORIGIN ?? 'http://localhost: 3000';
    this.apiPrefix = process.env.API_PREFIX ?? '/api/v1';

    this.jwt_secret = process.env.JWT_SECRET ?? 'your_secret_key';
    this.jwt_expires_in = process.env.JWT_EXPIRES_IN ?? '1d';
    this.jwt_refresh_secret =
      process.env.JWT_REFRESH_SECRET ?? 'your_refresh_secret_key';
    this.jwt_refresh_expires_in = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
