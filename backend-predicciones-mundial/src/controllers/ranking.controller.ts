import { Request, Response, NextFunction } from 'express';
import { rankingService } from '../services/ranking.service.js';

export class RankingController {
  async getGlobal(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const ranking = await rankingService.getGlobalRanking(limit);
      res.json({ status: 'success', data: { users: ranking, total: ranking.length, page: 1 } });
    } catch (error) {
      next(error);
    }
  }

  async getRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const ranking = await rankingService.getRoomRanking(req.params.roomId as string);
      res.json({ status: 'success', data: ranking });
    } catch (error) {
      next(error);
    }
  }

  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const ranking = await rankingService.getWeeklyRanking(limit);
      res.json({ status: 'success', data: { users: ranking } });
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const ranking = await rankingService.getMonthlyRanking(limit);
      res.json({ status: 'success', data: { users: ranking } });
    } catch (error) {
      next(error);
    }
  }

  async getHistorical(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const ranking = await rankingService.getHistoricalRanking(limit);
      res.json({ status: 'success', data: { users: ranking } });
    } catch (error) {
      next(error);
    }
  }

  async recalculate(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await rankingService.recalculateAll();
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const rankingController = new RankingController();
