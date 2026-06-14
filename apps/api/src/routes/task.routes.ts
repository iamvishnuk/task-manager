import { Router } from 'express';
import { z } from 'zod';
import {
  createTaskSchema,
  updateTaskSchema,
  TaskStatus
} from '@task-manager/shared/schemas/task';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import {
  validateRequest,
  validateParams,
  validateQuery
} from '../middlewares/validate.middleware';

export class TaskRouter {
  public readonly router: Router;
  private readonly controller: TaskController;

  constructor() {
    this.router = Router();
    this.controller = new TaskController();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.use(authenticate);

    this.router.post(
      '/',
      validateRequest(createTaskSchema),
      this.controller.createTask.bind(this.controller)
    );

    const listQuerySchema = z.object({
      status: TaskStatus.optional(),
      page: z.preprocess(
        (val) => (val ? Number(val) : 1),
        z.number().int().min(1).default(1)
      ),
      limit: z.preprocess(
        (val) => (val ? Number(val) : 10),
        z.number().int().min(1).max(100).default(10)
      )
    });

    this.router.get(
      '/',
      validateQuery(listQuerySchema),
      this.controller.listTasks.bind(this.controller)
    );

    const paramSchema = z.object({
      id: z.string().uuid('Invalid task ID format')
    });

    this.router.get(
      '/:id',
      validateParams(paramSchema),
      this.controller.getTaskById.bind(this.controller)
    );

    this.router.patch(
      '/:id',
      validateParams(paramSchema),
      validateRequest(updateTaskSchema),
      this.controller.updateTask.bind(this.controller)
    );

    this.router.delete(
      '/:id',
      validateParams(paramSchema),
      this.controller.deleteTask.bind(this.controller)
    );
  }
}
