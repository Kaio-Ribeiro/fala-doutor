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
                (age || ' Anos') AS name,
                COUNT(*)::INTEGER AS value
            FROM (
                SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER AS age
                FROM doctors
                WHERE birth_date IS NOT NULL
            ) sub
            GROUP BY age
            ORDER BY age;
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
                CASE 
                    WHEN age = 0 THEN 'Menos de 1 Ano'
                    ELSE age || ' Anos'
                END AS name,
                COUNT(*)::INTEGER AS value
            FROM (
                SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER AS age
                FROM patients
                WHERE birth_date IS NOT NULL
            ) sub
            GROUP BY age
            ORDER BY age;
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
            SELECT plans.value as name,
            COUNT(appointments.id) as value
            FROM appointments
            JOIN patients ON appointments.patient_id = patients.id
            JOIN plans ON patients.plan_id = plans.id
            GROUP BY plans.value
        `);
        return result.rows;
    }
}