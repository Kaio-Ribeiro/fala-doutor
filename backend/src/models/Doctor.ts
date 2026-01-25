import { pool } from '../config/database';

export interface Doctor {
  id?: number;
  name: string;
  specialty: string;
  crm: string;
  phone?: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class DoctorModel {
  async findAll(): Promise<Doctor[]> {
    const result = await pool.query('SELECT * FROM doctors ORDER BY id');
    return result.rows;
  }

  async findById(id: number): Promise<Doctor | null> {
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(doctor: Doctor): Promise<Doctor> {
    const { name, specialty, crm, phone, email } = doctor;
    const result = await pool.query(
      'INSERT INTO doctors (name, specialty, crm, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, specialty, crm, phone, email]
    );
    return result.rows[0];
  }

  async update(id: number, doctor: Partial<Doctor>): Promise<Doctor | null> {
    const { name, specialty, crm, phone, email } = doctor;
    const result = await pool.query(
      'UPDATE doctors SET name = COALESCE($1, name), specialty = COALESCE($2, specialty), crm = COALESCE($3, crm), phone = COALESCE($4, phone), email = COALESCE($5, email) WHERE id = $6 RETURNING *',
      [name, specialty, crm, phone, email, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
}