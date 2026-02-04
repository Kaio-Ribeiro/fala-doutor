import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';

const router = Router();

router.get('/', appointmentController.getAll);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.delete);

export default router;