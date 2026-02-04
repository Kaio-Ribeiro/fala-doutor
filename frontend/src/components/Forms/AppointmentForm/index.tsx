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
}

interface Patient {
  id?: number;
  name: string;
}

interface AppointmentFormData {
  id?: number;
  doctor_id: number;
  patient_id: number;
  appointment_datetime: string;
}

interface Props {
  initial?: AppointmentFormData | null;
  onCancel: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

export function AppointmentForm({ initial = null, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState(() => ({
    selectedDoctor: null as { value: number; label: string } | null,
    selectedPatient: null as { value: number; label: string } | null,
    selectedDate: '',
    selectedTime: '',
    ...initial
  }));

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.selectedDoctor || !form.selectedPatient || !form.selectedDate || !form.selectedTime) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const appointment_datetime = `${form.selectedDate}T${form.selectedTime}:00`;
      await onSubmit({
        doctor_id: form.selectedDoctor.value,
        patient_id: form.selectedPatient.value,
        appointment_datetime
      });
    } catch {
      // Error handling será feito pelo componente pai
    } finally {
      setIsSubmitting(false);
    }
  }

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id!,
    label: `${doctor.name} - ${doctor.specialty || 'Sem especialidade'}`
  }));

  const patientOptions = patients.map(patient => ({
    value: patient.id!,
    label: patient.name
  }));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Doutor" required>
        <Select
          options={doctorOptions}
          value={form.selectedDoctor}
          onChange={(selectedDoctor) => setForm(prev => ({ ...prev, selectedDoctor }))}
          placeholder="Selecione um doutor"
          isSearchable
          noOptionsMessage={() => "Nenhum doutor encontrado"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
          required
        />
      </FormField>
      
      <FormField label="Paciente" required>
        <Select
          options={patientOptions}
          value={form.selectedPatient}
          onChange={(selectedPatient) => setForm(prev => ({ ...prev, selectedPatient }))}
          placeholder="Selecione um paciente"
          isSearchable
          noOptionsMessage={() => "Nenhum paciente encontrado"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
          required
        />
      </FormField>
      
      <FormField label="Data" required>
        <input
          type="date"
          value={form.selectedDate}
          onChange={(e) => setForm(prev => ({ ...prev, selectedDate: e.target.value }))}
          className={styles.input}
          required
        />
      </FormField>
      
      <FormField label="Horário" required>
        <input
          type="time"
          value={form.selectedTime}
          onChange={(e) => setForm(prev => ({ ...prev, selectedTime: e.target.value }))}
          className={styles.input}
          min="08:00"
          max="17:00"
          step="1800"
          required
        />
      </FormField>

      <FormActions 
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}