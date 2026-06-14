import { NextFunction, Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { ResponseHandler } from '../utils/response-handler';
import { HttpStatus } from '../config/http';
import type { User } from '../db/schema/index';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus
} from '@task-manager/shared/schemas/task';

export class TaskController {
  private readonly taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const task = await this.taskService.createTask(
        user.id,
        req.body as CreateTaskInput
      );
      ResponseHandler.success(
        res,
        task,
        HttpStatus.CREATED,
        'Task created successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      // req.query has been parsed and typed by the query middleware validation
      const { status, page, limit } = req.query as unknown as {
        status?: TaskStatus;
        page: number;
        limit: number;
      };
      const result = await this.taskService.listTasks(user.id, {
        status,
        page,
        limit
      });
      ResponseHandler.success(
        res,
        result,
        HttpStatus.OK,
        'Tasks retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { id } = req.params as { id: string };
      const task = await this.taskService.getTaskById(user.id, id);
      ResponseHandler.success(
        res,
        task,
        HttpStatus.OK,
        'Task retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { id } = req.params as { id: string };
      const task = await this.taskService.updateTask(
        user.id,
        id,
        req.body as UpdateTaskInput
      );
      ResponseHandler.success(
        res,
        task,
        HttpStatus.OK,
        'Task updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { id } = req.params as { id: string };
      await this.taskService.deleteTask(user.id, id);
      ResponseHandler.success(
        res,
        null,
        HttpStatus.OK,
        'Task deleted successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
