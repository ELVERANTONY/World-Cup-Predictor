import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, predictionController.create.bind(predictionController));
router.put('/:id', authenticate, predictionController.update.bind(predictionController));
router.get('/my', authenticate, predictionController.getMyPredictions.bind(predictionController));
router.get('/match/:matchId', predictionController.getByMatch.bind(predictionController));
router.get('/room/:roomId', authenticate, predictionController.getByRoom.bind(predictionController));
router.get('/simulate', predictionController.simulateScore.bind(predictionController));

export default router;
