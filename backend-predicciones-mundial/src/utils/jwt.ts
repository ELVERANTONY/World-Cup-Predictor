import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role } satisfies TokenPayload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function generateRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role } satisfies TokenPayload,
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn } as jwt.SignOptions
  );
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
