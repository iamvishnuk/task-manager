import {
  type TLoginSchema,
  type TRegisterSchema
} from '@task-manager/shared/schemas/user';
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput
} from '@task-manager/shared/schemas/task';
import API from './axios-client';

export const registerMutationFn = (data: TRegisterSchema) =>
  API.post('/auth/signup', data);

export const loginMutationFn = (data: TLoginSchema) =>
  API.post('/auth/login', data);

// Task query and mutation functions

export interface GetTasksParams {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface GetTasksResponse {
  success: boolean;
  message: string;
  data: {
    tasks: (Task & { id: string })[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface GetTasksStatsResponse {
  success: boolean;
  message: string;
  data: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    total: number;
  };
}

export const getTasksQueryFn = (
  params: GetTasksParams
): Promise<GetTasksResponse> => API.get('/tasks', { params });

export const getTasksStatsQueryFn = (): Promise<GetTasksStatsResponse> =>
  API.get('/tasks/stats');

export const createTaskMutationFn = (data: CreateTaskInput) =>
  API.post('/tasks', data);

export const updateTaskMutationFn = ({
  id,
  data
}: {
  id: string;
  data: UpdateTaskInput;
}) => API.patch(`/tasks/${id}`, data);

export const deleteTaskMutationFn = (id: string) => API.delete(`/tasks/${id}`);
