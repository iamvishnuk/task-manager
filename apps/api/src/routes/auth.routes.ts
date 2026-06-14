import { Router } from 'express';
import { registerSchema, loginSchema } from '@task-manager/shared/schemas/user';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validateRequest } from '../middlewares/validate.middleware';

export class AuthRouter {
  public readonly router: Router;
  private readonly controller: AuthController;

  constructor() {
    this.router = Router();
    this.controller = new AuthController();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post(
      '/signup',
      validateRequest(registerSchema),
      this.controller.signup.bind(this.controller)
    );
    this.router.post(
      '/login',
      validateRequest(loginSchema),
      this.controller.login.bind(this.controller)
    );
    this.router.post('/refresh', this.controller.refresh.bind(this.controller));
    this.router.post(
      '/logout',
      authenticate,
      this.controller.logout.bind(this.controller)
    );
  }
}
