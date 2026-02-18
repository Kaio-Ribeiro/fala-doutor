import {pool} from '../config/database';

export interface Report {
    name: string;
    value: number;
}

export class ReportModel {
    async getDoctorsBySpecialty(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT doctors.specialty as name,
            COUNT(doctors.id)::INTEGER as value
            FROM doctors
            GROUP BY doctors.specialty
        `);
        return result.rows;
    }

    async getDoctorsByPlans(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT plans.name as name,
            COUNT(doctors.id)::INTEGER as value
            FROM doctors
            JOIN doctors_plans ON doctors.id = doctors_plans.doctor_id
            JOIN plans ON doctors_plans.plan_id = plans.id
            GROUP BY plans.name
        `);
        return result.rows;
    }

    async getDoctorsByAge(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT 
                age::TEXT AS name,
                COUNT(*)::INTEGER AS value
            FROM (
                SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER AS age
                FROM doctors
                WHERE birth_date IS NOT NULL
            ) sub
            GROUP BY age
            ORDER BY age::INTEGER;
        `);
        return result.rows;
    }

    async getPatientsByPlans(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT plans.name as name,
            COUNT(patients.id)::INTEGER as value
            FROM patients
            JOIN plans ON patients.plan_id = plans.id
            GROUP BY plans.name
        `);
        return result.rows;
    }

    async getPatientsByAge(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT 
                age::TEXT AS name,
                COUNT(*)::INTEGER AS value
            FROM (
                SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER AS age
                FROM patients
                WHERE birth_date IS NOT NULL
            ) sub
            GROUP BY age
            ORDER BY age::INTEGER;
        `);
        return result.rows;
    }

    async getAppointmentsByPlans(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT plans.name as name,
            COUNT(appointments.id)::INTEGER as value
            FROM appointments
            JOIN patients ON appointments.patient_id = patients.id
            JOIN plans ON patients.plan_id = plans.id
            GROUP BY plans.name
        `);
        return result.rows;
    }

    async getAppointmentsByValue(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT plans.value::TEXT as name,
            COUNT(appointments.id)::INTEGER as value
            FROM appointments
            JOIN patients ON appointments.patient_id = patients.id
            JOIN plans ON patients.plan_id = plans.id
            GROUP BY plans.value
        `);
        return result.rows;
    }

    async getAppointmentsByDate(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT 
                TO_CHAR(date_group, 'DD/MM/YYYY') as name,
                value
            FROM (
            SELECT 
                DATE(appointments.appointment_date) as date_group,
                COUNT(appointments.id)::INTEGER as value
            FROM appointments
            GROUP BY DATE(appointments.appointment_date)
            ) sub
            ORDER BY date_group;
        `);
        return result.rows;
    }

    async getAppointmentsByHour(): Promise<Report[]> {
        const result = await pool.query(`
            SELECT 
                LPAD(EXTRACT(HOUR FROM appointment_date)::TEXT, 2, '0') || ':00' AS name,
                COUNT(*)::INTEGER AS value
            FROM appointments
            GROUP BY EXTRACT(HOUR FROM appointment_date)
            ORDER BY EXTRACT(HOUR FROM appointment_date)
        `);
        return result.rows;
    }
}