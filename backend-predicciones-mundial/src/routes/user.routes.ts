import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), userController.getAll.bind(userController));
router.put('/me/winner', authenticate, userController.updatePredictedWinner.bind(userController));
router.get('/:id', authenticate, userController.getById.bind(userController));
router.patch('/:id/deactivate', authenticate, authorize('ADMIN'), userController.deactivate.bind(userController));

export default router;
