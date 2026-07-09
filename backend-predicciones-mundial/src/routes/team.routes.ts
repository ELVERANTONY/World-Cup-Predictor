import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', teamController.getAll.bind(teamController));
router.get('/:id', teamController.getById.bind(teamController));
router.post('/', authenticate, authorize('ADMIN'), teamController.create.bind(teamController));
router.put('/:id', authenticate, authorize('ADMIN'), teamController.update.bind(teamController));
router.delete('/:id', authenticate, authorize('ADMIN'), teamController.delete.bind(teamController));

export default router;
