import { Router } from 'express';
import authRoutes from './auth.routes.js';
import teamRoutes from './team.routes.js';
import stadiumRoutes from './stadium.routes.js';
import matchRoutes from './match.routes.js';
import predictionRoutes from './prediction.routes.js';
import roomRoutes from './room.routes.js';
import rankingRoutes from './ranking.routes.js';
import notificationRoutes from './notification.routes.js';
import statisticsRoutes from './statistics.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/teams', teamRoutes);
router.use('/stadiums', stadiumRoutes);
router.use('/matches', matchRoutes);
router.use('/predictions', predictionRoutes);
router.use('/rooms', roomRoutes);
router.use('/rankings', rankingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
