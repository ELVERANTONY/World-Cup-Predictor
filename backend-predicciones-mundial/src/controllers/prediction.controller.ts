import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { predictionService } from '../services/prediction.service.js';
import { scoringService } from '../services/scoring.service.js';

const createPredictionSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

const updatePredictionSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export class PredictionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPredictionSchema.parse(req.body);
      const userId = req.user!.userId;
      const result = await predictionService.create(userId, data.matchId, data.homeScore, data.awayScore);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updatePredictionSchema.parse(req.body);
      const userId = req.user!.userId;
      const result = await predictionService.update(userId, req.params.id as string, data.homeScore, data.awayScore);
      res.json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async getMyPredictions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;
      const predictions = await predictionService.getByUser(userId, status ? { status: status as string } : undefined);
      res.json({ status: 'success', data: predictions });
    } catch (error) {
      next(error);
    }
  }

  async getByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const predictions = await predictionService.getByMatch(req.params.matchId as string);
      res.json({ status: 'success', data: predictions });
    } catch (error) {
      next(error);
    }
  }

  async getByRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const predictions = await predictionService.getByRoom(req.params.roomId as string);
      res.json({ status: 'success', data: predictions });
    } catch (error) {
      next(error);
    }
  }

  async simulateScore(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = scoringService.calculatePoints(
        2, 1,
        2, 0,
        new Date(Date.now() + 48 * 60 * 60 * 1000),
        new Date(),
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const predictionController = new PredictionController();
