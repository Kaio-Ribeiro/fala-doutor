// src/controllers/patientController.ts
import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient';

const patientModel = new PatientModel();

export const patientController = {
  async getAll(req: Request, res: Response) {
    try {
      const patients = await patientModel.findAll();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching patients' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const patient = await patientModel.findById(Number(req.params.id));
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching patient' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const patient = await patientModel.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Error creating patient' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const patient = await patientModel.update(Number(req.params.id), req.body);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: 'Error updating patient' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await patientModel.delete(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting patient' });
    }
  },
};