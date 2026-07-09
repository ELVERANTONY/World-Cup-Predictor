import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { teamService } from '../services/team.service.js';

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  shortName: z.string().min(1).max(5),
  flagUrl: z.string().url(),
  group: z.string().optional(),
  rank: z.number().int().optional(),
});

const updateTeamSchema = createTeamSchema.partial();

export class TeamController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { group } = req.query;
      const teams = await teamService.getAll(group ? { group: group as string } : undefined);
      res.json({ status: 'success', data: teams });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getById(req.params.id as string);
      res.json({ status: 'success', data: team });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamSchema.parse(req.body);
      const team = await teamService.create(data);
      res.status(201).json({ status: 'success', data: team });
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
      const data = updateTeamSchema.parse(req.body);
      const team = await teamService.update(req.params.id as string, data);
      res.json({ status: 'success', data: team });
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
      const result = await teamService.delete(req.params.id as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
