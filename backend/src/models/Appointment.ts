import { pool } from '../config/database';
import { Doctor } from './Doctor';

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

  async getAvailableTimes(doctorId: number, patientId: number, date: string): Promise<string[]> {
    // Buscar agendamentos do doutor e paciente para a data específica
    const result = await pool.query(
      `SELECT appointment_date 
       FROM appointments 
       WHERE (doctor_id = $1 OR patient_id = $2)
       AND DATE(appointment_date) = $3`,
      [doctorId, patientId, date]
    );

    // Extrair horários ocupados
    const occupiedTimes = new Set<string>();
    result.rows.forEach(row => {
      const appointmentTime = new Date(row.appointment_date);
      const hours = appointmentTime.getHours();
      const minutes = appointmentTime.getMinutes();
      
      // Horário da consulta
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      occupiedTimes.add(timeSlot);
      
      // Como consulta dura 1h, bloquear próximo slot de 30min também
      const nextMinutes = minutes + 30;
      if (nextMinutes < 60) {
        const nextSlot = `${hours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
        occupiedTimes.add(nextSlot);
      } else {
        const nextHour = hours + 1;
        if (nextHour <= 17) {
          const nextSlot = `${nextHour.toString().padStart(2, '0')}:${(nextMinutes - 60).toString().padStart(2, '0')}`;
          occupiedTimes.add(nextSlot);
        }
      }

      // Bloquear também o slot 30 minutos antes da consulta
      const prevMinutes = minutes - 30;
      if (prevMinutes >= 0) {
        const prevSlot = `${hours.toString().padStart(2, '0')}:${prevMinutes.toString().padStart(2, '0')}`;
        occupiedTimes.add(prevSlot);
      } else {
        const prevHour = hours - 1;
        if (prevHour >= 8) {
          const prevSlot = `${prevHour.toString().padStart(2, '0')}:${(prevMinutes + 60).toString().padStart(2, '0')}`;
          occupiedTimes.add(prevSlot);
        }
      }
    });

    // Gerar todos os horários possíveis (08:00 às 17:30, intervalos de 30min)
    const allTimeSlots: string[] = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Última slot é 17:30
        if (hour === 17 && minute > 30) break;
        
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allTimeSlots.push(timeSlot);
      }
    }

    // Retornar apenas horários disponíveis
    return allTimeSlots.filter(time => !occupiedTimes.has(time));
  }
}