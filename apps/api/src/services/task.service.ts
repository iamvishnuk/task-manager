import { and, eq, count } from 'drizzle-orm';
import { db } from '../db/index';
import { tasks } from '../db/schema/index';
import { NotFoundError } from '../utils/error';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus
} from '@task-manager/shared/schemas/task';

export class TaskService {
  async createTask(userId: string, data: CreateTaskInput) {
    const [task] = await db
      .insert(tasks)
      .values({
        userId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate
      })
      .returning();

    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  }

  async listTasks(
    userId: string,
    filters: { status?: TaskStatus; page: number; limit: number }
  ) {
    const offset = (filters.page - 1) * filters.limit;

    const whereClause = filters.status
      ? and(eq(tasks.userId, userId), eq(tasks.status, filters.status))
      : eq(tasks.userId, userId);

    const tasksList = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .limit(filters.limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(tasks)
      .where(whereClause);

    const total = totalResult ? Number(totalResult.total) : 0;
    const totalPages = Math.ceil(total / filters.limit);

    return {
      tasks: tasksList,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages
      }
    };
  }

  async getTaskById(userId: string, taskId: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
      .limit(1);

    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const [task] = await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
      .returning();

    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async deleteTask(userId: string, taskId: string) {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
      .returning();

    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }
}
