import { describe, it, expect } from 'vitest';
import { taskSchema } from './task.js';

describe('taskSchema validation', () => {
  it('should validate a correct task payload', () => {
    const validTask = {
      title: 'Valid Task Name',
      description: 'Valid Task Description',
      dueDate: new Date().toISOString(),
      priority: 'HIGH',
      status: 'TODO'
    };

    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe(validTask.title);
      expect(result.data.dueDate).toBeInstanceOf(Date);
      expect(result.data.status).toBe('TODO');
      expect(result.data.priority).toBe('HIGH');
    }
  });

  it('should fail validation if title is missing or too long', () => {
    // Missing title
    const missingTitle = {
      description: 'Task description',
      dueDate: new Date().toISOString()
    };
    const result1 = taskSchema.safeParse(missingTitle);
    expect(result1.success).toBe(false);

    // Too long title (> 100 characters)
    const longTitle = {
      title: 'A'.repeat(101),
      description: 'Task description',
      dueDate: new Date().toISOString()
    };
    const result2 = taskSchema.safeParse(longTitle);
    expect(result2.success).toBe(false);
  });

  it('should fall back to defaults for status and priority', () => {
    const taskWithoutStatusOrPriority = {
      title: 'Default Fields Task',
      description: 'Task description',
      dueDate: new Date().toISOString()
    };

    const result = taskSchema.safeParse(taskWithoutStatusOrPriority);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('TODO');
      expect(result.data.priority).toBe('LOW');
    }
  });

  it('should validate and parse due dates properly', () => {
    const taskWithDateString = {
      title: 'Task with date string',
      description: 'Task description',
      dueDate: '2026-06-30T12:00:00.000Z'
    };

    const result = taskSchema.safeParse(taskWithDateString);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date);
      expect(result.data.dueDate.toISOString()).toBe('2026-06-30T12:00:00.000Z');
    }
  });
});
