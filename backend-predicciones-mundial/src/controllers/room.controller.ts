import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { roomService } from '../services/room.service.js';

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  password: z.string().min(4).optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().int().min(2).max(100).optional(),
});

const joinRoomSchema = z.object({
  code: z.string().min(1),
  password: z.string().optional(),
});

const updateRoomSchema = createRoomSchema.partial();

export class RoomController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createRoomSchema.parse(req.body);
      const userId = req.user!.userId;
      const room = await roomService.create({ ...data, createdById: userId });
      res.status(201).json({ status: 'success', data: room });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const data = joinRoomSchema.parse(req.body);
      const userId = req.user!.userId;
      const result = await roomService.joinRoomByCode(data.code, userId, data.password);
      res.json({ status: 'success', data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
        return;
      }
      next(error);
    }
  }

  async joinById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;
      const result = await roomService.joinRoom(req.params.id as string, userId, password);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await roomService.leaveRoom(req.params.id as string, userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async kickMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const memberId = req.params.memberId as string;
      const result = await roomService.kickMember(req.params.id as string, userId, memberId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateRoomSchema.parse(req.body);
      const userId = req.user!.userId;
      const room = await roomService.updateRoom(req.params.id as string, userId, data);
      res.json({ status: 'success', data: room });
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
      const userId = req.user!.userId;
      const result = await roomService.deleteRoom(req.params.id as string, userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async generateQR(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roomService.generateQRCode(req.params.id as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await roomService.getRoomMembers(req.params.id as string);
      res.json({ status: 'success', data: members });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { isPublic, userId, search } = req.query;
      const rooms = await roomService.getRooms({
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        userId: userId as string,
        search: search as string,
      });
      res.json({ status: 'success', data: rooms });
    } catch (error) {
      next(error);
    }
  }

  async getMyRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const rooms = await roomService.getRooms({ userId });
      res.json({ status: 'success', data: rooms });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await roomService.getRoom(req.params.id as string);
      res.json({ status: 'success', data: room });
    } catch (error) {
      next(error);
    }
  }
}

export const roomController = new RoomController();
