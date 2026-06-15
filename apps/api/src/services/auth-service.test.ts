import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import bcrypt from 'bcryptjs';
import { ConflictError, UnauthorizedError } from '../utils/error';

// Mock jwt utility module
vi.mock('../utils/jwt', () => ({
  signAccessToken: vi.fn(() => 'mock-access-token'),
  signRefreshToken: vi.fn(() => 'mock-refresh-token')
}));

// Mock DB
const mockSelectImpl = vi.fn();
const mockInsertImpl = vi.fn();
const mockDeleteImpl = vi.fn();

vi.mock('../db/index', () => {
  const chainSelect = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => mockSelectImpl())
  };

  const chainInsert = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockImplementation(() => mockInsertImpl())
  };

  const chainDelete = {
    where: vi.fn().mockImplementation(() => mockDeleteImpl())
  };

  return {
    db: {
      select: vi.fn().mockReturnValue(chainSelect),
      insert: vi.fn().mockReturnValue(chainInsert),
      delete: vi.fn().mockReturnValue(chainDelete)
    }
  };
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('signup', () => {
    it('should throw ConflictError if email is already in use', async () => {
      // Simulate existing user check returning a record
      mockSelectImpl.mockResolvedValueOnce([{ id: 'existing-id' }]);

      const signupData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      };

      await expect(authService.signup(signupData)).rejects.toThrow(
        ConflictError
      );
    });

    it('should register a new user successfully and return tokens', async () => {
      // 1. Simulate existing check: no user found
      mockSelectImpl.mockResolvedValueOnce([]);

      // 2. Simulate user insertion returning the created user
      const createdUser = {
        id: 'new-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date()
      };
      mockInsertImpl.mockResolvedValueOnce([createdUser]);

      // 3. Simulate session insertion (doesn't return anything needed)
      mockInsertImpl.mockResolvedValueOnce([]);

      const signupData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      };

      const result = await authService.signup(signupData);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user).toEqual(createdUser);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError if user does not exist', async () => {
      // Simulate user lookup: no user found
      mockSelectImpl.mockResolvedValueOnce([]);

      const loginData = {
        email: 'john@example.com',
        password: 'Password@123'
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw UnauthorizedError if password does not match', async () => {
      const dbUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('CorrectPassword@123', 10)
      };

      // Lookup: return user
      mockSelectImpl.mockResolvedValueOnce([dbUser]);

      const loginData = {
        email: 'john@example.com',
        password: 'WrongPassword@123'
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should login successfully with correct credentials', async () => {
      const rawPassword = 'CorrectPassword@123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const dbUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Lookup: return user
      mockSelectImpl.mockResolvedValueOnce([dbUser]);
      // Session insertion: success
      mockInsertImpl.mockResolvedValueOnce([]);

      const loginData = {
        email: 'john@example.com',
        password: rawPassword
      };

      const result = await authService.login(loginData);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.id).toBe(dbUser.id);
      expect(result.user.email).toBe(dbUser.email);
    });
  });
});
