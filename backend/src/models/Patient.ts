import { pool } from '../config/database';

export interface Patient {
  id?: number;
  name: string;
  cpf: string;
  birth_date: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: Date;
}

export class PatientModel {
  async findAll(): Promise<Patient[]> {
    const result = await pool.query('SELECT * FROM patients ORDER BY id');
    return result.rows;
  }

  async findById(id: number): Promise<Patient | null> {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(patient: Patient): Promise<Patient> {
    const { name, cpf, birth_date, phone, email, address } = patient;
    const result = await pool.query(
      'INSERT INTO patients (name, cpf, birth_date, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, cpf, birth_date, phone, email, address]
    );
    return result.rows[0];
  }

  async update(id: number, patient: Partial<Patient>): Promise<Patient | null> {
    const { name, cpf, birth_date, phone, email, address } = patient;
    const result = await pool.query(
      'UPDATE patients SET name = COALESCE($1, name), cpf = COALESCE($2, cpf), birth_date = COALESCE($3, birth_date), phone = COALESCE($4, phone), email = COALESCE($5, email), address = COALESCE($6, address) WHERE id = $7 RETURNING *',
      [name, cpf, birth_date, phone, email, address, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
}