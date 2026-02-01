import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient';

const patientModel = new PatientModel();

export const patientController = {
  async getAll(req: Request, res: Response) {
    try {
      const patients = await patientModel.findAll();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pacientes' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const patient = await patientModel.findById(Number(req.params.id));
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
  },

  async create(req: Request, res: Response) {
    const requiredFields = ['name', 'email', 'cpf', 'plan_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    if (req.body.cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve conter 11 dígitos' });
    }

    const existingEmail = await patientModel.findByEmail(req.body.email);
    if (existingEmail) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const existingCpf = await patientModel.findByCpf(req.body.cpf);
    if (existingCpf) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    const existingPhone = await patientModel.findByPhone(req.body.phone);
    if (existingPhone) {
      return res.status(400).json({ error: 'Telefone já cadastrado.' });
    }

    try {
      const patient = await patientModel.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar paciente' });
    }
  },

  async update(req: Request, res: Response) {
    const requiredFields = ['name', 'email', 'cpf', 'plan_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    if (req.body.cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve conter 11 dígitos' });
    }
    
    const existingEmail = await patientModel.findByEmail(req.body.email, Number(req.params.id));
    if (existingEmail) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const existingCpf = await patientModel.findByCpf(req.body.cpf, Number(req.params.id));
    if (existingCpf) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    const existingPhone = await patientModel.findByPhone(req.body.phone, Number(req.params.id));
    if (existingPhone) {
      return res.status(400).json({ error: 'Telefone já cadastrado.' });
    }
    try {
      const patient = await patientModel.update(Number(req.params.id), req.body);
      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await patientModel.delete(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar paciente' });
    }
  },
};