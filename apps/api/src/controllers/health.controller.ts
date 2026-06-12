import { Request, Response } from 'express';
import { HealthService } from '../services/health.service';
import { ResponseHandler } from '../utils/response-handler';

export class HealthController {
  private readonly healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  public getHealth = (_req: Request, res: Response): void => {
    const data = this.healthService.getStatus();
    ResponseHandler.success(res, data);
  };
}
