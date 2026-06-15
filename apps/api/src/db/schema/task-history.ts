import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './users';

export const taskHistory = pgTable('task_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'CREATE', 'UPDATE'
  description: text('description').notNull(), // e.g. "Changed status from TODO to IN_PROGRESS"
  changes: jsonb('changes')
    .$type<{ field: string; from: any; to: any }[]>()
    .default([]),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export type TaskHistory = typeof taskHistory.$inferSelect;
export type NewTaskHistory = typeof taskHistory.$inferInsert;
