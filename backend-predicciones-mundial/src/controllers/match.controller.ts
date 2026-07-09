import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { matchService } from '../services/match.service.js';
import { aiService } from '../services/ai.service.js';

const createMatchSchema = z.object({
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  date: z.string().datetime({ message: 'Invalid date format (ISO8601)' }),
  stage: z.string().min(1),
  stadiumId: z.string().optional(),
  referee: z.string().optional(),
});

const updateMatchSchema = createMatchSchema.partial();

const updateResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.enum(['FINISHED', 'LIVE']).optional(),
  extraTime: z.boolean().optional(),
  penalties: z.boolean().optional(),
});

export class MatchController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { stage, status, teamId, fromDate, toDate } = req.query;
      const matches = await matchService.getAll({
        stage: stage as string,
        status: status as string,
        teamId: teamId as string,
        fromDate: fromDate as string,
        toDate: toDate as string,
      });
      res.json({ status: 'success', data: matches });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const match = await matchService.getById(req.params.id as string);
      res.json({ status: 'success', data: match });
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const match = await matchService.getById(req.params.id as string);
      if (!match) {
        res.status(404).json({ status: 'error', message: 'Match not found' });
        return;
      }
      const insights = await aiService.getMatchInsights(req.params.id as string);
      res.json({ status: 'success', data: { insights } });
    } catch (error) {
      next(error);
    }
  }

  async generateAllInsights(_req: Request, res: Response, next: NextFunction) {
    try {
      const count = await aiService.generateInsightsForUpcoming();
      res.json({ status: 'success', data: { message: `Generated ${count} insights`, count } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMatchSchema.parse(req.body);
      const match = await matchService.create(data);
      res.status(201).json({ status: 'success', data: match });
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
      const data = updateMatchSchema.parse(req.body);
      const match = await matchService.update(req.params.id as string, data);
      res.json({ status: 'success', data: match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async updateResult(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateResultSchema.parse(req.body);
      const match = await matchService.updateResult(req.params.id as string, data);
      res.json({ status: 'success', data: match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await matchService.delete(req.params.id as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const matchController = new MatchController();
