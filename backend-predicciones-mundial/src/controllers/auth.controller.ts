import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const googleSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  favoriteTeamId: z.string().optional().or(z.literal('')),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data.email, data.password, data.name);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = googleSchema.parse(req.body);
      const result = await authService.googleLogin(data.token);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(data.refreshToken);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(data.email);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(data.token, data.password);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = changePasswordSchema.parse(req.body);
      const userId = req.user!.userId;
      const result = await authService.changePassword(userId, data.oldPassword, data.newPassword);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(data.token);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getProfile(userId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = updateProfileSchema.parse(req.body);
      const cleaned: Record<string, string> = {};
      if (data.name) cleaned.name = data.name;
      if (data.avatarUrl !== undefined) cleaned.avatarUrl = data.avatarUrl || '';
      if (data.favoriteTeamId !== undefined) cleaned.favoriteTeamId = data.favoriteTeamId || '';
      const result = await authService.updateProfile(userId, cleaned);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
