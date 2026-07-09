import { Router } from 'express';
import { stadiumController } from '../controllers/stadium.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', stadiumController.getAll.bind(stadiumController));
router.get('/:id', stadiumController.getById.bind(stadiumController));
router.post('/', authenticate, authorize('ADMIN'), stadiumController.create.bind(stadiumController));
router.put('/:id', authenticate, authorize('ADMIN'), stadiumController.update.bind(stadiumController));
router.delete('/:id', authenticate, authorize('ADMIN'), stadiumController.delete.bind(stadiumController));

export default router;
