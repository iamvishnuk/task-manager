export interface HealthStatus {
  status: 'ok';
  uptime: number;
  timestamp: string;
  version: string;
}

export class HealthService {
  private readonly version: string;

  constructor() {
    this.version = process.env['npm_package_version'] ?? '0.0.1';
  }

  public getStatus(): HealthStatus {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: this.version
    };
  }
}
