import { Request, Response, NextFunction } from 'express';
import { statisticsService } from '../services/statistics.service.js';

export class StatisticsController {
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.query.userId as string) || req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const stats = await statisticsService.getUserStats(userId);
      res.json({ status: 'success', data: stats });
    } catch (error: any) {
      if (error.message === 'User not found.') {
        res.status(404).json({ status: 'error', message: 'User not found.' });
        return;
      }
      next(error);
    }
  }

  async getGlobalStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getGlobalStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getMatchStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getMatchStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getGroupStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statisticsService.getGroupStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const statisticsController = new StatisticsController();
