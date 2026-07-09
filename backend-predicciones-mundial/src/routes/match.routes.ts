import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', matchController.getAll.bind(matchController));
router.get('/:id', matchController.getById.bind(matchController));
router.get('/:id/insights', authenticate, matchController.getInsights.bind(matchController));
router.post('/', authenticate, authorize('ADMIN'), matchController.create.bind(matchController));
router.put('/:id', authenticate, authorize('ADMIN'), matchController.update.bind(matchController));
router.patch('/:id/result', authenticate, authorize('ADMIN'), matchController.updateResult.bind(matchController));
router.delete('/:id', authenticate, authorize('ADMIN'), matchController.delete.bind(matchController));

export default router;
