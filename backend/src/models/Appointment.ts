import { pool } from '../config/database';

export interface Appointment {
  id?: number;
  doctor_id?: string;
  patient_id?: number[];
  appointment_date: Date;
  doctor_name?: string;
  patient_name?: string;
  plan_id?: number;
  plan_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class AppointmentModel {
  async findAll(): Promise<Appointment[]> {
      const result = await pool.query(`
        SELECT appointments.*, 
        doctors.name as doctor_name, 
        patients.name as patient_name,
        plans.id as plan_id,
        plans.name as plan_name
        FROM appointments 
        LEFT JOIN patients ON appointments.patient_id = patients.id 
        LEFT JOIN doctors ON appointments.doctor_id = doctors.id
        LEFT JOIN plans ON patients.plan_id = plans.id
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

  async getAvailableTimes(doctorId: number, patientId: number, date: string, appointmentId?: number | null): Promise<string[]> {
    // Buscar agendamentos do doutor e paciente para a data específica
    // Se `appointmentId` for informado, excluir esse registro da busca
    let query = `SELECT appointment_date 
       FROM appointments 
       WHERE (doctor_id = $1 OR patient_id = $2)
       AND DATE(appointment_date) = $3`;
    const params: any[] = [doctorId, patientId, date];

     if (appointmentId) {
      query += ' AND id <> $4';
      params.push(appointmentId);
    }

    const result = await pool.query(query, params);

    let timeSlots: Date[] = [];
    result.rows.forEach(row => {
      const appointmentTime = new Date(row.appointment_date);

      timeSlots.push(
        new Date(appointmentTime),
        new Date(appointmentTime.getTime() + 30 * 60 * 1000),
        new Date(appointmentTime.getTime() - 30 * 60 * 1000)
      );
    })

    const timeStrings = timeSlots.map(time => {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    const allTimeSlots: string[] = [
      '08:00', '08:30', '09:00', '09:30', 
      '10:00', '10:30', '11:00', '11:30', 
      '12:00', '12:30', '13:00', '13:30', 
      '14:00', '14:30', '15:00', '15:30', 
      '16:00', '16:30', '17:00', '17:30'];

    return allTimeSlots.filter(time => !timeStrings.includes(time));
  }
}