// Tipos Base
export type Doctor = {
  id: number;
  created_at: string;
  name: string;
  specialty: string;
  crm: string;
  birth_date: string;
  phone: string;
  email: string;
  plan_names?: string;
  plan_ids?: number[];
}

export type Patient = {
  id: number;
  created_at: string;
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  plan_id: number;
  plan_name: string;
}

export type Plan = {
  id: number;
  created_at: string;
  name: string;
  code: string;
  value: string;
}

export type Appointment = {
    id: number;
    created_at: string;
    doctor_name: string;
    patient_name: string;
    plan_id: number;
    plan_name: string;
    appointment_date: string;
};

// Tipos de Formulário
export type DoctorFormData = {
    id?: number;
    name: string;
    specialty?: string;
    crm: string;
    birth_date?: string;
    phone?: string;
    email: string;
    plan_ids: number[];
};

export type PatientFormData = {
    id?: number;
    name: string;
    cpf: string;
    birth_date: string;
    phone?: string;
    email: string;
    plan_id?: number;
};

export type PlanFormData = {
    id?: number;
    name: string;
    code: string;
    value: string;
};

export type AppointmentFormData = {
    id?: number;
    doctor_id: number;
    patient_id: number;
    appointment_date?: string;
};

// Tipos Auxiliares
export type ModuleType = 'doctors' | 'patients' | 'plans' | 'appointments';

export type FormSubmissionData = DoctorFormData | PatientFormData | PlanFormData | AppointmentFormData;

export type TypeData = Doctor | Patient | Plan | Appointment;