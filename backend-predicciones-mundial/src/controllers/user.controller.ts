import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

const updatePredictedWinnerSchema = z.object({
  teamId: z.string().min(1),
});

export class UserController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          totalPoints: true,
          accuracyRate: true,
          rank: true,
          level: true,
          createdAt: true,
        },
        orderBy: { rank: 'asc' },
      });
      res.json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      if (userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        throw new AppError('Not authorized to view this profile.', 403);
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          totalPoints: true,
          accuracyRate: true,
          rank: true,
          level: true,
          predictionsCount: true,
          currentStreak: true,
          maxStreak: true,
          createdAt: true,
          favoriteTeam: true,
          predictedWinner: true,
        },
      });
      if (!user) throw new AppError('User not found.', 404);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', 404);
      await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
      res.json({ status: 'success', data: { message: 'User deactivated.' } });
    } catch (error) {
      next(error);
    }
  }

  async updatePredictedWinner(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { teamId } = updatePredictedWinnerSchema.parse(req.body);
      
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) throw new AppError('Team not found.', 404);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { predictedWinnerId: teamId },
        select: { id: true, predictedWinner: true }
      });

      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
