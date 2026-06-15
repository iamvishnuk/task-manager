import { SQL, and, eq, count, or, ilike, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { tasks, taskHistory, users } from '../db/schema/index';
import { NotFoundError } from '../utils/error';
import { getStorageService } from './storage.service';
import { SSEConnectionManager } from '../utils/sse-connection-manager';
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

    // Log creation history
    await db.insert(taskHistory).values({
      taskId: task.id,
      userId,
      action: 'CREATE',
      description: 'Task created',
      changes: []
    });

    SSEConnectionManager.getInstance().notifyUser(userId, {
      type: 'TASK_CHANGED',
      data: { action: 'CREATE', taskId: task.id }
    });

    return task;
  }

  async listTasks(
    userId: string,
    userRole: string,
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

    const conditions: SQL[] = [];
    if (userRole !== 'ADMIN') {
      conditions.push(eq(tasks.userId, userId));
    }

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
      .select({
        id: tasks.id,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        attachmentUrl: tasks.attachmentUrl,
        attachmentName: tasks.attachmentName,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        userEmail: users.email,
        userName: users.name
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.userId, users.id))
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

  async getTaskStats(userId: string, userRole: string = 'USER') {
    const buildStatsCondition = (status: TaskStatus) => {
      const conds = [eq(tasks.status, status)];
      if (userRole !== 'ADMIN') {
        conds.push(eq(tasks.userId, userId));
      }
      return and(...conds);
    };

    const [todo] = await db
      .select({ count: count() })
      .from(tasks)
      .where(buildStatsCondition('TODO'));
    const [inProgress] = await db
      .select({ count: count() })
      .from(tasks)
      .where(buildStatsCondition('IN_PROGRESS'));
    const [done] = await db
      .select({ count: count() })
      .from(tasks)
      .where(buildStatsCondition('DONE'));

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

  async getTaskById(userId: string, taskId: string, userRole: string = 'USER') {
    const condition =
      userRole === 'ADMIN'
        ? eq(tasks.id, taskId)
        : and(eq(tasks.userId, userId), eq(tasks.id, taskId));

    const [task] = await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        attachmentUrl: tasks.attachmentUrl,
        attachmentName: tasks.attachmentName,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        userEmail: users.email,
        userName: users.name
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.userId, users.id))
      .where(condition)
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

    // Compare fields for history log
    const changes: { field: string; from: any; to: any }[] = [];
    const compareDates = (d1: any, d2: any) => {
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      return new Date(d1).getTime() === new Date(d2).getTime();
    };

    if (data.title !== undefined && data.title !== existing.title) {
      changes.push({ field: 'title', from: existing.title, to: data.title });
    }
    if (
      data.description !== undefined &&
      data.description !== existing.description
    ) {
      changes.push({
        field: 'description',
        from: existing.description,
        to: data.description
      });
    }
    if (data.status !== undefined && data.status !== existing.status) {
      changes.push({ field: 'status', from: existing.status, to: data.status });
    }
    if (data.priority !== undefined && data.priority !== existing.priority) {
      changes.push({
        field: 'priority',
        from: existing.priority,
        to: data.priority
      });
    }
    if (
      data.dueDate !== undefined &&
      !compareDates(data.dueDate, existing.dueDate)
    ) {
      changes.push({
        field: 'due date',
        from: existing.dueDate,
        to: data.dueDate
      });
    }
    if (
      data.attachmentUrl !== undefined &&
      data.attachmentUrl !== existing.attachmentUrl
    ) {
      changes.push({
        field: 'attachment',
        from: existing.attachmentName || null,
        to: data.attachmentName || null
      });
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

    // Log update history
    if (changes.length > 0) {
      let description = 'Updated task details';
      if (changes.length === 1) {
        const c = changes[0]!;
        const formatVal = (v: any) =>
          v === null ? 'none' : String(v).replace('_', ' ');
        description = `Changed ${c.field} from "${formatVal(c.from)}" to "${formatVal(c.to)}"`;
      } else {
        description = `Updated fields: ${changes.map((c) => c.field).join(', ')}`;
      }

      await db.insert(taskHistory).values({
        taskId: task.id,
        userId,
        action: 'UPDATE',
        description,
        changes
      });
    }

    SSEConnectionManager.getInstance().notifyUser(userId, {
      type: 'TASK_CHANGED',
      data: { action: 'UPDATE', taskId: task.id }
    });

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

    SSEConnectionManager.getInstance().notifyUser(userId, {
      type: 'TASK_CHANGED',
      data: { action: 'DELETE', taskId: task.id }
    });

    return task;
  }

  async getTaskHistory(
    userId: string,
    taskId: string,
    userRole: string = 'USER'
  ) {
    // Validate task access
    await this.getTaskById(userId, taskId, userRole);

    const logs = await db
      .select({
        id: taskHistory.id,
        taskId: taskHistory.taskId,
        userId: taskHistory.userId,
        action: taskHistory.action,
        description: taskHistory.description,
        changes: taskHistory.changes,
        createdAt: taskHistory.createdAt,
        userEmail: users.email
      })
      .from(taskHistory)
      .leftJoin(users, eq(taskHistory.userId, users.id))
      .where(eq(taskHistory.taskId, taskId))
      .orderBy(desc(taskHistory.createdAt));

    return logs;
  }
}
