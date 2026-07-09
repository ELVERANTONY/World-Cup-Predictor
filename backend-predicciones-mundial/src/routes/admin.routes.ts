import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN'), adminController.getDashboard.bind(adminController));
router.get('/audit-logs', authenticate, authorize('ADMIN'), adminController.getAuditLogs.bind(adminController));
router.post('/sync', authenticate, authorize('ADMIN'), adminController.syncWorldCup.bind(adminController));

export default router;
