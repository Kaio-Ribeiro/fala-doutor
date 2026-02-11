import React, { useState, useEffect, forwardRef } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IMaskInput from 'react-imask/esm/input';

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
}

interface Props {
  initial?: AppointmentFormData | null;
  onCancel: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

export function AppointmentForm({ initial = null, onCancel, onSubmit }: Props) {
  // Função helper para formatação de data consistente
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helpers para extrair data e hora do appointment_date
  const getSelectedDate = () => {
    if (!form.appointment_date) return '';
    return form.appointment_date.split('T')[0];
  };

  const getSelectedTime = () => {
    if (!form.appointment_date) return '';
    const timePart = form.appointment_date.split('T')[1];
    if (!timePart) return '';
    return timePart.slice(0, 5) || '';
  };

  // Converte uma ISO (UTC) para uma string datetime local sem sufixo de timezone
  const toLocalDateTimeString = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const [form, setForm] = useState<AppointmentFormData>(() => {
    const appointment_date = initial?.appointment_date ? toLocalDateTimeString(initial.appointment_date) : (initial?.appointment_date || '');
    return {
      doctor_id: 0,
      patient_id: 0,
      ...initial,
      appointment_date
    };
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const fetchAvailableTimes = async (doctorId: number, patientId: number, date: string, appointmentId?: number) => {
    try {
      const params = new URLSearchParams();
      if (doctorId > 0) params.append('doctor_id', doctorId.toString());
      if (patientId > 0) params.append('patient_id', patientId.toString());
      if (appointmentId && appointmentId > 0) params.append('appointment_id', appointmentId.toString());
      params.append('date', date);

      const response = await fetch(`http://localhost:3000/api/appointments/available-times?${params}`);
      const times: string[] = await response.json();
      setAvailableTimeSlots(times);
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      setAvailableTimeSlots([]);
    }
  };

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

  // Buscar horários disponíveis quando doutor, paciente e data estão preenchidos
  useEffect(() => {
    const selectedDate = form.appointment_date ? form.appointment_date.split('T')[0] : '';
    if (form.doctor_id > 0 && form.patient_id > 0 && selectedDate) {
      fetchAvailableTimes(form.doctor_id, form.patient_id, selectedDate, form.id);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [form.doctor_id, form.patient_id, form.appointment_date, form.id]);

  function handlePatientChange(selectedOption: { value?: number; label: string } | null) {
    const currentDate = getSelectedDate();
    setForm(prev => ({ 
      ...prev, 
      patient_id: selectedOption?.value || 0,
      appointment_date: currentDate || ''
    }));
  }

  function handleDoctorChange(selectedOption: { value?: number; label: string } | null) {
      const currentDate = getSelectedDate();
      setForm(prev => ({ 
        ...prev, 
        doctor_id: selectedOption?.value || 0,
        appointment_date: currentDate || '' // Manter apenas a data se existir
      }));
  }

  function handleDatePickerChange(date: Date | null) {
    if (date) {
      const formattedDate = formatDate(date);
      // Não tentar manter horário anterior, deixar apenas com a data
      setForm(prev => ({ ...prev, appointment_date: formattedDate }));
    } else {
      setForm(prev => ({ ...prev, appointment_date: '' }));
    }
  }

  function handleTimeChange(selectedOption: { value?: string; label: string } | null) {
    const currentDate = getSelectedDate();
    
    if (selectedOption?.value && currentDate) {
      const newAppointmentDate = `${currentDate}T${selectedOption.value}:00`;
      setForm(prev => ({ ...prev, appointment_date: newAppointmentDate }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(form);
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

  const MaskedInput = forwardRef((props, ref) => (
  <IMaskInput
    {...props}
    mask="00/00/0000"
    placeholder="dd/mm/aaaa"
    ref={ref}
  />
));

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
            <DatePicker 
              selected={getSelectedDate() ? new Date(getSelectedDate() + 'T00:00:00') : null}
              onChange={handleDatePickerChange}
              customInput={<MaskedInput/>}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione uma data"
              className={styles.input}
              isClearable
              required
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </FormField>
        </div>
        
        <div style={{ flex: 1 }}>
          <FormField label="Horário" required>
            <Select
              options={availableTimeSlots.map(time => ({
                value: time,
                label: time
              }))}
              value={getSelectedTime() ? { value: getSelectedTime(), label: getSelectedTime() } : null}
              onChange={handleTimeChange}
              placeholder="Selecione um horário"
              isDisabled={!form.doctor_id || !form.patient_id || !getSelectedDate()}
              noOptionsMessage={() => "Nenhum horário disponível"}
              className={styles.reactSelect}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 99999 })
              }}
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