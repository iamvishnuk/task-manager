import {
  type TLoginSchema,
  type TRegisterSchema
} from '@task-manager/shared/schemas/user';
import API from './axios-client';

export const registerMutationFn = (data: TRegisterSchema) =>
  API.post('/auth/signup', data);

export const loginMutationFn = (data: TLoginSchema) =>
  API.post('/auth/login', data);
