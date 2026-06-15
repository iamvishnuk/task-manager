import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from './task.service';

// Mock DB
const mockInsertImpl = vi.fn();
const mockSelectImpl = vi.fn();

vi.mock('../db/index', () => {
  const chainInsert = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => mockInsertImpl())
  };

  const chainSelect = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => mockSelectImpl())
  };

  return {
    db: {
      insert: vi.fn().mockReturnValue(chainInsert),
      select: vi.fn().mockReturnValue(chainSelect)
    }
  };
});

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    taskService = new TaskService();
  });

  describe('createTask', () => {
    it('should create a task successfully and log create event to history', async () => {
      const userId = 'user-123';
      const taskInput = {
        title: 'New Task Name',
        description: 'New Task Description',
        status: 'TODO' as const,
        priority: 'LOW' as const,
        dueDate: new Date('2026-06-30T12:00:00.000Z')
      };

      const createdTask = {
        id: 'task-abc',
        userId,
        ...taskInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachmentUrl: null,
        attachmentName: null
      };

      // 1. Simulate the task insertion returning the created task
      mockInsertImpl.mockResolvedValueOnce([createdTask]);
      // 2. Simulate the history log insertion (success)
      mockInsertImpl.mockResolvedValueOnce([]);

      const result = await taskService.createTask(userId, taskInput);

      expect(result).toEqual(createdTask);
    });

    it('should throw an error if task creation fails to return a record', async () => {
      const userId = 'user-123';
      const taskInput = {
        title: 'New Task Name',
        description: 'New Task Description',
        status: 'TODO' as const,
        priority: 'LOW' as const,
        dueDate: new Date()
      };

      // Return empty array (simulation of insert failing)
      mockInsertImpl.mockResolvedValueOnce([]);

      await expect(taskService.createTask(userId, taskInput)).rejects.toThrow(
        'Failed to create task'
      );
    });
  });
});
