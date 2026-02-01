import {pool} from '../config/database';
import { Patient } from './Patient';

export interface Plan {
    id: number;
    name: string;
    code: string;
    value: number;
    created_at?: Date;
    updated_at?: Date;
}

export class PlanModel {
    async findAll(): Promise<Plan[]> {
        const result = await pool.query('SELECT * FROM plans ORDER BY id');
        return result.rows;
    }

    async findByCode(code: string, excludeId?: number): Promise<Plan | null> {
        let query = 'SELECT * FROM plans WHERE code = $1';
        const params: any[] = [code];
        if (excludeId) {
          query += ' AND id <> $2';
          params.push(excludeId);
        }
        const result = await pool.query(query, params);
        return result.rows[0] || null;
      }

    async create(plan: Plan): Promise<Plan> {
        const { name, code, value } = plan;
        const result = await pool.query(
          'INSERT INTO plans (name, code, value) VALUES ($1, $2, $3) RETURNING *',
          [name, code, value]
        );
        return result.rows[0];
    }

    async update(id: number, plan: Partial<Plan>): Promise<Plan | null> {
        const { name, code, value } = plan;
        const result = await pool.query(
          'UPDATE plans SET name = COALESCE($1, name), code = COALESCE($2, code), value = COALESCE($3, value) WHERE id = $4 RETURNING *',
          [name, code, value, id]
        );
        return result.rows[0] || null;
      }
    
    async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM plans WHERE id = $1', [id]);
        return result.rowCount! > 0;
    }
}