import { pool } from '../config/database';

export interface Patient {
  id?: number;
  name: string;
  cpf: string;
  phone?: string;
  email: string;
  plan_id: number;
  plan_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class PatientModel {
  async findAll(): Promise<Patient[]> {
    const result = await pool.query(`
      SELECT patients.*, plans.name as plan_name 
      FROM patients 
      LEFT JOIN plans ON patients.plan_id = plans.id 
      ORDER BY patients.id
    `);
    return result.rows;
  }

  async findById(id: number): Promise<Patient | null> {
    const result = await pool.query(`
      SELECT patients.*, plans.name as plan_name 
      FROM patients 
      LEFT JOIN plans ON patients.plan_id = plans.id 
      WHERE patients.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string, excludeId?: number): Promise<Patient | null> {
    let query = 'SELECT * FROM patients WHERE email = $1';
    const params: any[] = [email];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async findByCpf(cpf: string, excludeId?: number): Promise<Patient | null> {
    let query = 'SELECT * FROM patients WHERE cpf = $1';
    const params: any[] = [cpf];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async findByPhone(phone: string, excludeId?: number): Promise<Patient | null> {
    let query = 'SELECT * FROM patients WHERE phone = $1';
    const params: any[] = [phone];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async create(patient: Patient): Promise<Patient> {
    const { name, cpf, phone, email, plan_id } = patient;
    const result = await pool.query(
      'INSERT INTO patients (name, cpf, phone, email, plan_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, cpf, phone, email, plan_id]
    );
    return result.rows[0];
  }

  async update(id: number, patient: Partial<Patient>): Promise<Patient | null> {
    const { name, cpf, phone, email, plan_id } = patient;
    const result = await pool.query(
      'UPDATE patients SET name = COALESCE($1, name), cpf = COALESCE($2, cpf), phone = COALESCE($3, phone), email = COALESCE($4, email), plan_id = COALESCE($5, plan_id) WHERE id = $6 RETURNING *',
      [name, cpf, phone, email, plan_id, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
}