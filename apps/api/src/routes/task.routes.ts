import { Router } from 'express';
import { z } from 'zod';
import {
  createTaskSchema,
  updateTaskSchema,
  TaskStatus,
  TaskPriority
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

    // POST /tasks — create a task
    this.router.post(
      '/',
      validateRequest(createTaskSchema),
      this.controller.createTask.bind(this.controller)
    );

    // GET /tasks/stats — get task counts by status
    // Must be registered BEFORE /:id to prevent matching stats as an ID parameter
    this.router.get(
      '/stats',
      this.controller.getTaskStats.bind(this.controller)
    );

    // GET /tasks — list tasks with pagination, filtering, searching and sorting
    const listQuerySchema = z.object({
      status: TaskStatus.optional(),
      priority: TaskPriority.optional(),
      search: z.string().optional(),
      sort: z.string().optional(),
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

    // UUID parameter validator
    const paramSchema = z.object({
      id: z.string().uuid('Invalid task ID format')
    });

    // GET /tasks/:id — fetch a single task
    this.router.get(
      '/:id',
      validateParams(paramSchema),
      this.controller.getTaskById.bind(this.controller)
    );

    // PATCH /tasks/:id — update a task
    this.router.patch(
      '/:id',
      validateParams(paramSchema),
      validateRequest(updateTaskSchema),
      this.controller.updateTask.bind(this.controller)
    );

    // DELETE /tasks/:id — delete a task
    this.router.delete(
      '/:id',
      validateParams(paramSchema),
      this.controller.deleteTask.bind(this.controller)
    );
  }
}
