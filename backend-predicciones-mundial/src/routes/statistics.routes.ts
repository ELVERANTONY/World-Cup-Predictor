import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/global', statisticsController.getGlobalStats.bind(statisticsController));
router.get('/user/:userId?', authenticate, statisticsController.getUserStats.bind(statisticsController));
router.get('/matches', statisticsController.getMatchStats.bind(statisticsController));
router.get('/groups', statisticsController.getGroupStats.bind(statisticsController));

export default router;
