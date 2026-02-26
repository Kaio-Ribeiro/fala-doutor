import { pool } from '../config/database';

export interface Doctor {
  id?: number;
  name: string;
  specialty: string;
  crm: string;
  phone?: string;
  email?: string;
  plan_names?: string;
  plan_ids?: number[];
  birth_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class DoctorModel {
  async findAll(): Promise<Doctor[]> {
      const result = await pool.query(`
        SELECT 
          doctors.*,
          STRING_AGG(plans.name, ', ' ORDER BY plans.name) as plan_names,
          ARRAY_AGG(plans.id ORDER BY plans.name) FILTER (WHERE plans.id IS NOT NULL) as plan_ids
        FROM doctors
        LEFT JOIN doctors_plans ON doctors.id = doctors_plans.doctor_id
        LEFT JOIN plans ON doctors_plans.plan_id = plans.id
        GROUP BY 
          doctors.id
        ORDER BY doctors.id
      `);
      return result.rows;
    }

  async findByEmail(email: string, excludeId?: number): Promise<Doctor | null> {
    let query = 'SELECT * FROM doctors WHERE email = $1';
    const params: any[] = [email];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async findByCrm(crm: string, excludeId?: number): Promise<Doctor | null> {
    let query = 'SELECT * FROM doctors WHERE crm = $1';
    const params: any[] = [crm];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async findByPhone(phone: string, excludeId?: number): Promise<Doctor | null> {
    let query = 'SELECT * FROM doctors WHERE phone = $1';
    const params: any[] = [phone];
    if (excludeId) {
      query += ' AND id <> $2';
      params.push(excludeId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  async create(doctor: Doctor): Promise<Doctor> {
    const { name, specialty, crm, phone, email, birth_date } = doctor;
    const result = await pool.query(
      'INSERT INTO doctors (name, specialty, crm, phone, email, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, specialty, crm, phone, email, birth_date]
    );
    return result.rows[0];
  }

  async update(id: number, doctor: Partial<Doctor>): Promise<Doctor | null> {
    const { name, specialty, crm, phone, email, birth_date } = doctor;
    const result = await pool.query(
      `UPDATE doctors 
      SET name = COALESCE($1, name), 
      specialty = COALESCE($2, specialty), 
      crm = COALESCE($3, crm), 
      phone = COALESCE($4, phone), 
      email = COALESCE($5, email), 
      birth_date = COALESCE($6, birth_date) 
      WHERE id = $7 RETURNING *`,
      [name, specialty, crm, phone, email, birth_date, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }

  async addPlans(doctorId: number, planIds: number[]): Promise<void> {
    if (planIds.length === 0) return;
    
    const values = planIds.map((_, index) => `($1, $${index + 2})`).join(', ');
    const query = `INSERT INTO doctors_plans (doctor_id, plan_id) VALUES ${values}`;
    const params = [doctorId, ...planIds];
    
    await pool.query(query, params);
  }

  async removePlans(doctorId: number): Promise<void> {
    await pool.query('DELETE FROM doctors_plans WHERE doctor_id = $1', [doctorId]);
  }

  async getPlans(doctorId: number): Promise<number[]> {
    const result = await pool.query('SELECT plan_id FROM doctors_plans WHERE doctor_id = $1', [doctorId]);
    return result.rows.map(row => row.plan_id);
  }
}