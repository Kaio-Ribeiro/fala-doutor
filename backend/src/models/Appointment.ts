import { pool } from '../config/database';
import { Doctor } from './Doctor';

export interface Appointment {
  id?: number;
  doctor_id?: string;
  patient_id?: number[];
  appointment_date: Date;
  doctor_name?: string;
  patient_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class AppointmentModel {
  async findAll(): Promise<Appointment[]> {
      const result = await pool.query(`
        SELECT appointments.*, doctors.name as doctor_name, patients.name as patient_name
        FROM appointments 
        LEFT JOIN patients ON appointments.patient_id = patients.id 
        LEFT JOIN doctors ON appointments.doctor_id = doctors.id
        ORDER BY appointments.id
      `);
      return result.rows;
    }

  async create(appointment: Appointment): Promise<Appointment> {
    const { doctor_id, patient_id, appointment_date } = appointment;
    const result = await pool.query(
      'INSERT INTO appointments (doctor_id, patient_id, appointment_date) VALUES ($1, $2, $3) RETURNING *',
      [doctor_id, patient_id, appointment_date]
    );
    return result.rows[0];
  }

  async update(id: number, appointment: Partial<Appointment>): Promise<Appointment | null> {
    const { doctor_id, patient_id, appointment_date } = appointment;
    const result = await pool.query(
      'UPDATE appointments SET doctor_id = COALESCE($1, doctor_id), patient_id = COALESCE($2, patient_id), appointment_date = COALESCE($3, appointment_date) WHERE id = $4 RETURNING *',
      [doctor_id, patient_id, appointment_date, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
}