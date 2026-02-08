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

interface AppointmentDate {
  appointment_date: string;
  date: string;
  time: string;
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
    return form.appointment_date.split('T')[1]?.slice(0, 5) || '';
  };

  const [form, setForm] = useState<AppointmentFormData>(() => {
    return {
      doctor_id: 0,
      patient_id: 0,
      appointment_date: initial?.appointment_date || '',
      ...initial
    };
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<{[date: string]: string[]}>({});

  const fetchAppointmentDates = async (type: 'doctor' | 'patient', id: number) => {
    try {
      const endpoint = type === 'doctor' ? 'doctor' : 'patient';
      const param = type === 'doctor' ? 'doctor_id' : 'patient_id';
      const response = await fetch(`http://localhost:3000/api/appointments/dates/${endpoint}?${param}=${id}`);
      const appointments: AppointmentDate[] = await response.json();
      
      // Agrupar por data
      const timeSlots: {[date: string]: string[]} = {};
      appointments.forEach((apt: AppointmentDate) => {
        if (!timeSlots[apt.date]) {
          timeSlots[apt.date] = [];
        }
        timeSlots[apt.date].push(apt.time);
      });
      
      return timeSlots;
    } catch (error) {
      console.error(`Erro ao buscar horários do ${type}:`, error);
      return {};
    }
  };

  // Helper para combinar múltiplos objetos de timeSlots
  const combineTimeSlots = (timeSlotsArray: {[date: string]: string[]}[]) => {
    return timeSlotsArray.reduce((combined, timeSlots) => {
      Object.entries(timeSlots).forEach(([date, times]) => {
        combined[date] = combined[date] ? [...combined[date], ...times] : [...times];
      });
      return combined;
    }, {} as {[date: string]: string[]});
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

  const updateBlockedTimeSlots = async (doctorId: number, patientId: number) => {
    const promises = [];
    
    if (doctorId > 0) {
      promises.push(fetchAppointmentDates('doctor', doctorId));
    }
    
    if (patientId > 0) {
      promises.push(fetchAppointmentDates('patient', patientId));
    }
    
    try {
      const results = await Promise.all(promises);
      const combinedTimeSlots = combineTimeSlots(results);
      setBlockedTimeSlots(combinedTimeSlots);
    } catch (error) {
      console.error('Erro ao atualizar horários bloqueados:', error);
      setBlockedTimeSlots({});
    }
  };

  const getAvailableTimeSlots = (selectedDate: string) => {
    const allTimeSlots = [];
    
    // Gerar horários de 8:00 às 16:00 (intervalos de 1h)
    for (let hour = 8; hour < 17; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      allTimeSlots.push(timeString);
    }
    
    // Remover horários bloqueados para esta data
    const blockedForDate = blockedTimeSlots[selectedDate] || [];
    return allTimeSlots.filter(time => !blockedForDate.includes(time));
  };

  function handlePatientChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, patient_id: selectedOption?.value || 0 }));
    
    updateBlockedTimeSlots(form.doctor_id, selectedOption?.value || 0);
  }

  function handleDoctorChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, doctor_id: selectedOption?.value || 0 }));
    
    updateBlockedTimeSlots(selectedOption?.value || 0, form.patient_id);
  }

  function handleDatePickerChange(date: Date | null) {
    const currentTime = getSelectedTime() || '08:00';
    
    if (date) {
      const formattedDate = formatDate(date);
      const newAppointmentDate = `${formattedDate}T${currentTime}:00`;
      setForm(prev => ({ ...prev, appointment_date: newAppointmentDate }));
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
              options={getAvailableTimeSlots(getSelectedDate()).map(time => ({
                value: time,
                label: time
              }))}
              value={getSelectedTime() ? { value: getSelectedTime(), label: getSelectedTime() } : null}
              onChange={handleTimeChange}
              placeholder="Selecione um horário"
              isDisabled={!getSelectedDate()}
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