import { z } from 'zod';

export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type TaskPriority = z.infer<typeof TaskPriority>;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or less'),
  status: TaskStatus.default('TODO'),
  priority: TaskPriority.default('LOW'),
  dueDate: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      return typeof val === 'string' ? new Date(val) : val;
    },
    z.date({ message: 'Due date is required' })
  ),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable()
});

export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = taskSchema;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = taskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
