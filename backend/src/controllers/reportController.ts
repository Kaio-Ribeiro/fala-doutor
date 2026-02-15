import {Request, Response} from 'express';
import { ReportModel } from '../models/Report';

const reportModel = new ReportModel();

export const reportController = {
    async getDoctorsReports(req: Request, res: Response) {
        try {
            const { type } = req.query;

            let reports;
            if (type === 'speciality') {
                reports = await reportModel.getDoctorsBySpeciality();
            } else if (type === 'plans') {
                reports = await reportModel.getDoctorsByPlans();
            } else {
                return res.status(400).json({error: 'Tipo de relatório inválido'});
            }
            res.json(reports);
        } catch (error) {
            res.status(500).json({error: 'Erro ao listar relatórios'});
        }
    },

    async getPatientsReports(req: Request, res: Response) {
        try {
            const { type } = req.query;

            let reports;
            if (type === 'plans') {
                reports = await reportModel.getPatientsByPlans();
            } else {
                return res.status(400).json({error: 'Tipo de relatório inválido'});
            }
            res.json(reports);
        } catch (error) {
            res.status(500).json({error: 'Erro ao listar relatórios'});
        }
    },


    async getAppointmentsReports(req: Request, res: Response) {
        try {
            const { type } = req.query;

            let reports;
            if (type === 'plans') {
                reports = await reportModel.getAppointmentsByPlans();
            } else {
                return res.status(400).json({error: 'Tipo de relatório inválido'});
            }
            res.json(reports);
        } catch (error) {
            res.status(500).json({error: 'Erro ao listar relatórios'});
        }
    },
}