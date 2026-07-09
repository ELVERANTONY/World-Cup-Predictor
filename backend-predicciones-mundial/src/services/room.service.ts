import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export class RoomService {
  private generateCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  async create(data: {
    name: string;
    description?: string;
    password?: string;
    isPublic?: boolean;
    maxMembers?: number;
    createdById: string;
  }) {
    let code: string;
    let exists = true;

    do {
      code = this.generateCode();
      exists = !!(await prisma.room.findUnique({ where: { code } }));
    } while (exists);

    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

    const room = await prisma.room.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        password: hashedPassword,
        isPublic: data.isPublic ?? true,
        maxMembers: data.maxMembers ?? 20,
        createdById: data.createdById,
        members: {
          create: {
            userId: data.createdById,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    return room;
  }

  async joinRoom(roomId: string, userId: string, password?: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) throw new AppError('Room not found.', 404);
    if (!room.isPublic && !password) {
      throw new AppError('This room requires a password.', 401);
    }

    if (room.password && password) {
      const valid = await comparePassword(password, room.password);
      if (!valid) throw new AppError('Incorrect room password.', 401);
    }

    const isMember = room.members.some((m) => m.userId === userId);
    if (isMember) throw new AppError('You are already a member of this room.', 409);

    if (room.members.length >= room.maxMembers) {
      throw new AppError('Room has reached maximum capacity.', 400);
    }

    const member = await prisma.roomMember.create({
      data: { roomId, userId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.activity.create({
      data: {
        userId,
        type: 'room_joined',
        message: `Joined room "${room.name}"`,
        metadata: { roomId, roomName: room.name },
      },
    });

    return member;
  }

  async joinRoomByCode(code: string, userId: string, password?: string) {
    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) throw new AppError('Room not found.', 404);
    return this.joinRoom(room.id, userId, password);
  }

  async leaveRoom(roomId: string, userId: string) {
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) throw new AppError('You are not a member of this room.', 404);

    const adminCount = await prisma.roomMember.count({
      where: { roomId, role: 'ADMIN' },
    });

    if (member.role === 'ADMIN' && adminCount <= 1) {
      throw new AppError('Transfer ownership before leaving.', 400);
    }

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });

    return { message: 'Left room successfully.' };
  }

  async kickMember(roomId: string, adminId: string, memberId: string) {
    const admin = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: adminId } },
    });
    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError('Only room admins can kick members.', 403);
    }

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: memberId } },
    });
    if (!member) throw new AppError('Member not found.', 404);
    if (member.role === 'ADMIN') {
      throw new AppError('Cannot kick another admin.', 400);
    }

    await prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId: memberId } },
    });

    return { message: 'Member kicked successfully.' };
  }

  async updateRoom(roomId: string, userId: string, data: {
    name?: string;
    description?: string;
    password?: string;
    isPublic?: boolean;
    maxMembers?: number;
  }) {
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member || member.role !== 'ADMIN') {
      throw new AppError('Only room admins can update settings.', 403);
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    return prisma.room.update({
      where: { id: roomId },
      data: updateData,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError('Room not found.', 404);
    if (room.createdById !== userId) {
      throw new AppError('Only the creator can delete the room.', 403);
    }

    await prisma.room.delete({ where: { id: roomId } });
    return { message: 'Room deleted successfully.' };
  }

  async generateQRCode(roomId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError('Room not found.', 404);

    const joinUrl = `worldcup-predictor://join/${room.code}`;
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;

    return { qrDataUrl, joinUrl, code: room.code };
  }

  async getRoomMembers(roomId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError('Room not found.', 404);

    return prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            totalPoints: true,
            accuracyRate: true,
          },
        },
      },
      orderBy: { points: 'desc' },
    });
  }

  async getRooms(params: { isPublic?: boolean; userId?: string; search?: string }) {
    const where: Record<string, unknown> = {};

    if (params.isPublic !== undefined) where.isPublic = params.isPublic;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.userId) {
      where.members = { some: { userId: params.userId } };
    }

    return prisma.room.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoom(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, totalPoints: true, accuracyRate: true } }
          },
          orderBy: { points: 'desc' }
        }
      },
    });

    if (!room) {
      throw new AppError('Room not found', 404);
    }
    return room;
  }
}

export const roomService = new RoomService();
