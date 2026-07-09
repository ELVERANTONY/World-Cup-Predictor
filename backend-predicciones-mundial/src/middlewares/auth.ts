import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export type AppRole = 'USER' | 'ADMIN';

export interface AuthPayload {
  userId: string;
  role: AppRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      params: Record<string, string>;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication required. Token is empty.', 401);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new AppError('Invalid or expired token.', 401);
  }

  req.user = { userId: decoded.userId, role: decoded.role as AppRole };
  next();
}

export function authorize(...allowedRoles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions.', 403);
    }

    next();
  };
}
