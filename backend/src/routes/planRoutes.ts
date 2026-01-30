import { Router } from 'express'
import { planController } from '../controllers/planController'

const router = Router()

router.get('/', planController.getAll)
router.post('/', planController.create)
router.put('/:id', planController.update)
router.delete('/:id', planController.delete)

export default router;