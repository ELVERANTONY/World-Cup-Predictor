import { Router } from 'express';
import { rankingController } from '../controllers/ranking.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/global', rankingController.getGlobal.bind(rankingController));
router.get('/room/:roomId', rankingController.getRoom.bind(rankingController));
router.get('/weekly', rankingController.getWeekly.bind(rankingController));
router.get('/monthly', rankingController.getMonthly.bind(rankingController));
router.get('/historical', rankingController.getHistorical.bind(rankingController));
router.post('/recalculate', authenticate, authorize('ADMIN'), rankingController.recalculate.bind(rankingController));

export default router;
