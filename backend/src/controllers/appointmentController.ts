import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment';

const appointmentModel = new AppointmentModel();

export const appointmentController = {
  async getAll(req: Request, res: Response) {
    try {
      const appointments = await appointmentModel.findAll();
      res.json(appointments);
    } catch (error) {
    //   res.status(500).json({ error: 'Erro ao listar consultas' });
        res.status(500).json({
          error: 'Erro ao listar consultas', 
          details: error instanceof Error ? error.message : String(error)
        });
    }
  },

  async create(req: Request, res: Response) {
    const requiredFields = ['doctor_id', 'patient_id', 'appointment_date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    try {
      const appointment = await appointmentModel.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar consulta' });
    }
  },

  async update(req: Request, res: Response) {
    const requiredFields = ['doctor_id', 'patient_id', 'appointment_date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    try {
        const appointment = await appointmentModel.update(Number(req.params.id), req.body);
        if (!appointment) {
            return res.status(404).json({ error: 'Consulta não encontrada' });
        }
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar consulta' });
    }
},

  async delete(req: Request, res: Response) {
    try {
      const deleted = await appointmentModel.delete(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar consulta' });
    }
  },
};