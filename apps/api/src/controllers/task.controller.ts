import { NextFunction, Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { ResponseHandler } from '../utils/response-handler';
import { getStorageService } from '../services/storage.service';
import { HttpStatus } from '../config/http';
import { SSEConnectionManager } from '../utils/sse-connection-manager';
import type { User } from '../db/schema/index';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority
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

  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        ResponseHandler.error(
          res,
          new Error('No file uploaded'),
          HttpStatus.BAD_REQUEST
        );
        return;
      }

      const storageService = getStorageService();
      const fileUrl = await storageService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      ResponseHandler.success(
        res,
        {
          url: fileUrl,
          filename: req.file.originalname
        },
        HttpStatus.OK,
        'File uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      // req.query has been parsed and typed by the query middleware validation
      const { status, priority, search, sort, page, limit } =
        req.query as unknown as {
          status?: TaskStatus;
          priority?: TaskPriority;
          search?: string;
          sort?: string;
          page: number;
          limit: number;
        };
      const result = await this.taskService.listTasks(user.id, {
        status,
        priority,
        search,
        sort,
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

  async getTaskStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const stats = await this.taskService.getTaskStats(user.id);
      ResponseHandler.success(
        res,
        stats,
        HttpStatus.OK,
        'Task stats retrieved successfully'
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

  async getTaskHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { id } = req.params as { id: string };
      const history = await this.taskService.getTaskHistory(user.id, id);
      ResponseHandler.success(
        res,
        history,
        HttpStatus.OK,
        'Task history retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getTaskEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      const sseManager = SSEConnectionManager.getInstance();
      sseManager.addConnection(user.id, res);

      req.on('close', () => {
        sseManager.removeConnection(user.id, res);
      });
    } catch (error) {
      next(error);
    }
  }
}
