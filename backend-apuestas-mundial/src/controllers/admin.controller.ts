import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export class AdminController {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        totalPredictions,
        totalMatches,
        totalRooms,
        totalTeams,
        totalStadiums,
        totalAchievements,
        recentUsers,
        recentMatches,
        recentActivities,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.prediction.count(),
        prisma.match.count(),
        prisma.room.count(),
        prisma.team.count(),
        prisma.stadium.count(),
        prisma.achievement.count(),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, email: true, createdAt: true },
        }),
        prisma.match.findMany({
          orderBy: { date: 'desc' },
          take: 5,
          include: { homeTeam: true, awayTeam: true },
        }),
        prisma.activity.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true } } },
        }),
      ]);

      res.json({
        status: 'success',
        data: {
          counts: {
            users: totalUsers,
            predictions: totalPredictions,
            matches: totalMatches,
            rooms: totalRooms,
            teams: totalTeams,
            stadiums: totalStadiums,
            achievements: totalAchievements,
          },
          recentUsers,
          recentMatches,
          recentActivities,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async syncWorldCup(_req: Request, res: Response, next: NextFunction) {
    try {
      const { syncService } = await import('../services/sync.service.js');
      const result = await syncService.syncFromOpenFootball();
      res.json({
        status: 'success',
        data: {
          message: 'World Cup 2026 data synchronized successfully',
          ...result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { auditService } = await import('../services/audit.service.js');
      const { userId, action, entity, fromDate, toDate } = req.query;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const result = await auditService.getLogs({
        userId: userId as string,
        action: action as string,
        entity: entity as string,
        fromDate: fromDate as string,
        toDate: toDate as string,
        page,
        limit,
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
