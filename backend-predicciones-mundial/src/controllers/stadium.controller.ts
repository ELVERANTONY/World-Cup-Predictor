import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { stadiumService } from '../services/stadium.service.js';

const createStadiumSchema = z.object({
  name: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  capacity: z.number().int().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surface: z.string().optional(),
});

const updateStadiumSchema = createStadiumSchema.partial();

export class StadiumController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const stadiums = await stadiumService.getAll();
      res.json({ status: 'success', data: stadiums });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const stadium = await stadiumService.getById(req.params.id as string);
      res.json({ status: 'success', data: stadium });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createStadiumSchema.parse(req.body);
      const stadium = await stadiumService.create(data);
      res.status(201).json({ status: 'success', data: stadium });
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
      const data = updateStadiumSchema.parse(req.body);
      const stadium = await stadiumService.update(req.params.id as string, data);
      res.json({ status: 'success', data: stadium });
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
      const result = await stadiumService.delete(req.params.id as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const stadiumController = new StadiumController();
