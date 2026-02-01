import { Router } from 'express';
import { patientController } from '../controllers/patientController';

const router = Router();

router.get('/', patientController.getAll);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);

export default router;