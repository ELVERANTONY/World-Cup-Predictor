import { Router } from 'express';
import { roomController } from '../controllers/room.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, roomController.getAll.bind(roomController));
router.get('/my', authenticate, roomController.getMyRooms.bind(roomController));
router.get('/:id', authenticate, roomController.getById.bind(roomController));
router.post('/', authenticate, roomController.create.bind(roomController));
router.post('/join', authenticate, roomController.join.bind(roomController));
router.post('/:id/join', authenticate, roomController.joinById.bind(roomController));
router.post('/:id/leave', authenticate, roomController.leave.bind(roomController));
router.post('/:id/kick/:memberId', authenticate, roomController.kickMember.bind(roomController));
router.put('/:id', authenticate, roomController.update.bind(roomController));
router.delete('/:id', authenticate, roomController.delete.bind(roomController));
router.get('/:id/members', authenticate, roomController.getMembers.bind(roomController));
router.get('/:id/qrcode', authenticate, roomController.generateQR.bind(roomController));

export default router;
