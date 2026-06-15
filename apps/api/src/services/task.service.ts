import { SQL, and, eq, count, or, ilike, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { tasks } from '../db/schema/index';
import { NotFoundError } from '../utils/error';
import { getStorageService } from './storage.service';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority
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
        dueDate: data.dueDate,
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName
      })
      .returning();

    if (!task) {
      throw new Error('Failed to create task');
    }
    return task;
  }

  async listTasks(
    userId: string,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
      sort?: string;
      page: number;
      limit: number;
    }
  ) {
    const offset = (filters.page - 1) * filters.limit;

    const conditions = [eq(tasks.userId, userId)];

    if (filters.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${filters.search}%`),
          ilike(tasks.description, `%${filters.search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    // Build order by clause
    let orderByClause: SQL = asc(tasks.dueDate); // default
    if (filters.sort === 'dueDate_desc') {
      orderByClause = desc(tasks.dueDate);
    } else if (filters.sort === 'dueDate_asc') {
      orderByClause = asc(tasks.dueDate);
    } else if (filters.sort === 'priority_desc') {
      orderByClause = sql`CASE ${tasks.priority} WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 1 END DESC`;
    } else if (filters.sort === 'priority_asc') {
      orderByClause = sql`CASE ${tasks.priority} WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 1 END ASC`;
    } else if (filters.sort === 'createdAt_desc') {
      orderByClause = desc(tasks.createdAt);
    } else if (filters.sort === 'createdAt_asc') {
      orderByClause = asc(tasks.createdAt);
    }

    const tasksList = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(orderByClause)
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

  async getTaskStats(userId: string) {
    const [todo] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'TODO')));
    const [inProgress] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'IN_PROGRESS')));
    const [done] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'DONE')));

    const todoCount = todo ? Number(todo.count) : 0;
    const inProgressCount = inProgress ? Number(inProgress.count) : 0;
    const doneCount = done ? Number(done.count) : 0;
    const totalCount = todoCount + inProgressCount + doneCount;

    return {
      TODO: todoCount,
      IN_PROGRESS: inProgressCount,
      DONE: doneCount,
      total: totalCount
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
    const existing = await this.getTaskById(userId, taskId);

    // If attachmentUrl is being updated and is different from the old one, clean up the old file
    if (
      data.attachmentUrl !== undefined &&
      data.attachmentUrl !== existing.attachmentUrl
    ) {
      if (existing.attachmentUrl) {
        const storageService = getStorageService();
        await storageService.deleteFile(existing.attachmentUrl);
      }
    }

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

    if (task.attachmentUrl) {
      const storageService = getStorageService();
      await storageService.deleteFile(task.attachmentUrl);
    }

    return task;
  }
}
