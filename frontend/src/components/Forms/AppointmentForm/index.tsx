import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';

interface Doctor {
  id?: number;
  name: string;
  specialty?: string;
  plan_ids?: number[];
}

interface Patient {
  id?: number;
  name: string;
  plan_id?: number;
  plan_name?: string;
}

interface AppointmentFormData {
  id?: number;
  doctor_id: number;
  patient_id: number;
  appointment_date?: string;
  selected_date: string;
  selected_time: string;
}

interface Props {
  initial?: AppointmentFormData | null;
  onCancel: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

export function AppointmentForm({ initial = null, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<AppointmentFormData>(() => {
    const initialForm = {
      doctor_id: 0,
      patient_id: 0,
      selected_date: '',
      selected_time: '',
      ...initial
    };

    // Se existe appointment_date nos dados iniciais, extrai date e time
    if (initial?.appointment_date) {
      const date = new Date(initial.appointment_date);
      initialForm.selected_date = date.toISOString().split('T')[0];
      initialForm.selected_time = date.toTimeString().slice(0, 5);
    }

    return initialForm;
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('http://localhost:3000/api/patients'),
          fetch('http://localhost:3000/api/doctors')
        ]);
        
        if (!patientsRes.ok || !doctorsRes.ok) {
          throw new Error('Falha ao buscar dados');
        }
        
        const [patientsJson, doctorsJson] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json()
        ]);
        
        if (!cancelled) {
          setPatients(patientsJson);
          setDoctors(doctorsJson);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar pacientes e doutores!');
      }
    };
    
    fetchData();
    return () => { cancelled = true; };
  }, []);

  function handlePatientChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, patient_id: selectedOption?.value || 0 }));
  }

  function handleDoctorChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, doctor_id: selectedOption?.value || 0 }));
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, selected_date: e.target.value }));
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, selected_time: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const appointment_date = `${form.selected_date}T${form.selected_time}:00`;
      await onSubmit({ ...form, appointment_date });
    } catch {
      // Error handling será feito pelo componente pai
    } finally {
      setIsSubmitting(false);
    }
  }

  const doctorOptions = doctors.map(doctor => {
    const selectedPatient = patients.find(p => p.id === form.patient_id);
    const attendsPlan = selectedPatient?.plan_id && doctor.plan_ids?.includes(selectedPatient.plan_id);
    
    return {
      value: doctor.id!,
      label: attendsPlan 
        ? `${doctor.name} - Atende ao plano` 
        : doctor.name
    };
  });

  const patientOptions = patients.map(patient => ({
    value: patient.id!,
    label: patient.name
  }));

  const selectedPatient = patientOptions.find(option => option.value === form.patient_id) || null;
  const selectedDoctor = doctorOptions.find(option => option.value === form.doctor_id) || null
  const selectedPlan = patients.find(p => p.id === form.patient_id)?.plan_name || '';

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Paciente" required>
        <Select
          options={patientOptions}
          value={selectedPatient}
          onChange={handlePatientChange}
          placeholder="Selecione um paciente"
          isSearchable
          isClearable
          noOptionsMessage={() => "Nenhum paciente encontrado"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
          required
        />
      </FormField>

      <FormField label="Plano" required>
        <input
          type="text"
          className={styles.input}
          value={selectedPlan}
          readOnly  
        />
      </FormField>

      <FormField label="Doutor" required>
        <Select
          options={doctorOptions}
          value={selectedDoctor}
          onChange={handleDoctorChange}
          placeholder="Selecione um doutor"
          isSearchable
          isClearable
          noOptionsMessage={() => "Nenhum doutor encontrado"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
          required
        />
      </FormField>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <FormField label="Data" required>
            <input
              type="date"
              value={form.selected_date}
              onChange={handleDateChange}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={styles.input}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </FormField>
        </div>
        
        <div style={{ flex: 1 }}>
          <FormField label="Horário" required>
            <input
              type="time"
              value={form.selected_time}
              onChange={handleTimeChange}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={styles.input}
              min="08:00"
              max="17:00"
              required
            />
          </FormField>
        </div>
      </div>

      <FormActions 
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}