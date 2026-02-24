import React, { useState, forwardRef } from 'react';
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IMaskInput from 'react-imask/esm/input';
import type { Doctor, Patient, AppointmentFormData } from '../../../types';
import { useFetch } from '../../../hooks/useFetch';
import { useAvailableTime } from '../../../hooks/useAvailableTime';

interface Props {
  initial?: AppointmentFormData | null;
  onCancel: () => void;
  onSubmit: (data: AppointmentFormData) => void;
}

export function AppointmentForm({ initial = null, onCancel, onSubmit }: Props) {
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

  const getSelectedDate = () => form.appointment_date?.split('T')[0] || '';
  const getSelectedTime = () => form.appointment_date?.split('T')[1]?.slice(0, 5) || '';

  // Dados iniciais do formulário
  const [form, setForm] = useState<AppointmentFormData>(() => ({
    doctor_id: 0,
    patient_id: 0,
    ...initial,
    appointment_date: toLocalDateTimeString(initial?.appointment_date)
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks para buscar a lista de doutores e pacientes para popular os selects
  const { data: doctorsData } = useFetch<Doctor[]>('/doctors');
  const { data: patientsData } = useFetch<Patient[]>('/patients');

  // Hook para buscar os horários disponíveis
  // Com base no doctor_id, patient_id e appointment_date do formulário
  const { availableTimeSlots } = useAvailableTime({
    doctorId: form.doctor_id,
    patientId: form.patient_id,
    date: getSelectedDate(),
    appointmentId: form.id
  });

  // Função para lidar com a mudança no select de pacientes
  function handlePatientChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ 
      ...prev, 
      patient_id: selectedOption?.value || 0,
      appointment_date: getSelectedDate()
    }));
  }

  // Função para lidar com a mudança no select de doutores
  function handleDoctorChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ 
      ...prev, 
      doctor_id: selectedOption?.value || 0,
      appointment_date: getSelectedDate()
    }));
  }

  // Função para lidar com a mudança no date picker
  function handleDatePickerChange(date: Date | null) {
    const formattedDate = date ? date.toISOString().split('T')[0] : '';
    setForm(prev => ({ ...prev, appointment_date: formattedDate }));
  }

  // Função para lidar com a mudança no select de horários
  function handleTimeChange(selectedOption: { value?: string; label: string } | null) {
    const currentDate = getSelectedDate();
    const newAppointmentDate = selectedOption?.value && currentDate 
      ? `${currentDate}T${selectedOption.value}:00` 
      : currentDate;
    setForm(prev => ({ ...prev, appointment_date: newAppointmentDate }));
  }

  // Ao fazer o submit do formulário chama a função onSubmit 
  // passada pelo componente pai, que é o hook useSubmit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // O isSubmitting é passado para o FormActions 
    // para desabilitar os botões enquanto a requisição está em andamento
    setIsSubmitting(true);
    
    try {
      await onSubmit(form);
    } catch {
      // Error handling será feito pelo componente pai
    } finally {
      setIsSubmitting(false);
    }
  }

  // Encontrar o paciente selecionado para mostrar o nome do plano dele
  const selectedPatient = patientsData?.find(p => p.id === form.patient_id);

  // Mapeia os pacientes para o formato esperado pelo react-select
  const patientOptions = patientsData?.map(patient => ({
    value: patient.id!,
    label: patient.name
  })) || [];

  // Filtra os doutores com base no plano do paciente selecionado 
  // e mapeia para o formato do react-select
  const doctorOptions = selectedPatient?.plan_id 
    ? doctorsData?.filter(doctor => doctor.plan_ids?.includes(selectedPatient.plan_id))
        .map(doctor => ({ value: doctor.id!, label: doctor.name })) || []
    : [];

  // Encontra o paciente, doutor e horário selecionados para mostrar como valor atual dos selects
  const currentPatient = patientOptions.find(option => option.value === form.patient_id) || null;
  const currentDoctor = doctorOptions.find(option => option.value === form.doctor_id) || null;
  const currentTime = getSelectedTime() ? { value: getSelectedTime(), label: getSelectedTime() } : null;

  // Componente customizado para o date picker com máscara de data
  const MaskedInput = forwardRef((props, ref) => (
  <IMaskInput
    {...props}
    mask="00/00/0000"
    placeholder="dd/mm/aaaa"
    ref={ref}
  />
));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Paciente" required>
        <Select
          options={patientOptions}
          value={currentPatient}
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
          value={selectedPatient?.plan_name || ''}
          readOnly  
        />
      </FormField>

      <FormField label="Doutor" required>
        <Select
          options={doctorOptions}
          value={currentDoctor}
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
              options={availableTimeSlots.map(time => ({ value: time, label: time }))}
              value={currentTime}
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