import {Request, Response} from 'express';
import { PlanModel } from '../models/Plans';

const planModel = new PlanModel();

export const planController = {
    async getAll(req: Request, res: Response) {
        try {
            const plans = await planModel.findAll();
            res.json(plans);
        } catch (error) {
            res.status(500).json({error: 'Erro ao listar planos'});
        }
    },

    async create(req: Request, res: Response) {
        const requiredFields = ['name', 'value', 'code'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
    
        if (missingFields.length > 0) {
          return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
        }

        const existingCode = await planModel.findByCode(req.body.code);
        if (existingCode) {
          return res.status(400).json({ error: 'Código já cadastrado.' });
        }
    
        try {
          const plan = await planModel.create(req.body);
          res.status(201).json(plan);
        } catch (error) {
          res.status(500).json({ error: 'Erro ao criar plano' });
        }
      },

      async update(req: Request, res: Response) {
          const requiredFields = ['name', 'value', 'code'];
          const missingFields = requiredFields.filter(field => !req.body[field]);
      
          if (missingFields.length > 0) {
            return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
          }

          const existingCode = await planModel.findByCode(req.body.code, Number(req.params.id));
          if (existingCode) {
            return res.status(400).json({ error: 'Código já cadastrado.' });
          }
          
          try {
            const plan = await planModel.update(Number(req.params.id), req.body);
            if (!plan) {
              return res.status(404).json({ error: 'Plano não encontrado' });
            }
            res.json(plan);
          } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar plano' });
          }
        },
      
        async delete(req: Request, res: Response) {
          try {
            const deleted = await planModel.delete(Number(req.params.id));
            if (!deleted) {
              return res.status(404).json({ error: 'Plano não encontrado' });
            }
            res.status(204).send();
          } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar plano' });
          }
        },
}