import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export class HealthRouter {
  public readonly router: Router;
  private readonly controller: HealthController;

  constructor() {
    this.router = Router();
    this.controller = new HealthController();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', this.controller.getHealth);
  }
}
