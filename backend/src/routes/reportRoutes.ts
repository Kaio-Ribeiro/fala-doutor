import { Router } from 'express'
import { reportController } from '../controllers/reportController'

const router = Router()

router.get('/doctors', reportController.getDoctorsReports)
router.get('/patients', reportController.getPatientsReports)
router.get('/appointments', reportController.getAppointmentsReports)

export default router;