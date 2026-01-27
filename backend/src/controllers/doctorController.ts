// src/controllers/doctorController.ts
import { Request, Response } from 'express';
import { DoctorModel } from '../models/Doctor';

const doctorModel = new DoctorModel();

export const doctorController = {
  async getAll(req: Request, res: Response) {
    try {
      const doctors = await doctorModel.findAll();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar doutores' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const doctor = await doctorModel.findById(Number(req.params.id));
      if (!doctor) {
        return res.status(404).json({ error: 'Doutor não encontrado' });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar doutor' });
    }
  },

  async create(req: Request, res: Response) {
    const requiredFields = ['name', 'email', 'crm'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }
    
    try {
      const doctor = await doctorModel.create(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar doutor' });
    }
  },

  async update(req: Request, res: Response) {
    const requiredFields = ['name', 'email', 'crm'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    try {
      const doctor = await doctorModel.update(Number(req.params.id), req.body);
      if (!doctor) {
        return res.status(404).json({ error: 'Doutor não encontrado' });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar doutor' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await doctorModel.delete(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Doutor não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar doutor' });
    }
  },
};