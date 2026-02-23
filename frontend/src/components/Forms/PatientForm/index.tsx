import React, { useState } from 'react';
import { IMaskInput } from "react-imask";
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';
import { DatePicker } from 'react-datepicker';
import { useFetch } from '../../../hooks/useFetch';
import type { Plan, PatientFormData } from '../../../types';

interface Props {
  initial?: PatientFormData | null;
  onCancel: () => void;
  onSubmit: (data: PatientFormData) => void;
}

export function PatientForm({ initial = null, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<PatientFormData>(() => ({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    plan_id: undefined,
    ...initial,
    birth_date: initial?.birth_date?.slice(0,10) || ''
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data } = useFetch<Plan[]>('/plans');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    let newValue: string | number | string[] = value;
    if (name === 'birth_date') {
      newValue = value ? value.slice(0,10) : ''
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  }

  function handleDatePickerChange(date: Date | null) {
    if (date) {
      const formattedDate = date.toISOString().slice(0, 10);
      setForm(prev => ({ ...prev, birth_date: formattedDate }));
    } else {
      setForm(prev => ({ ...prev, birth_date: '' }));
    }
  }

  function handlePlanChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, plan_id: selectedOption?.value || undefined }));
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

  const planOptions = data?.map(plan => ({
    value: plan.id,
    label: plan.name
  })) || [];

  const selectedPlan = planOptions.find(option => option.value === form.plan_id) || null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField label="Nome" required>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className={styles.input} 
          required 
        />
      </FormField>

      <FormField label="CPF" required>
        <IMaskInput 
          mask="000.000.000-00" 
          name="cpf" 
          unmask={true}
          value={form.cpf}
          onAccept={(value) => setForm(prev => ({ ...prev, cpf: value }))}
          className={styles.input}
          placeholder="000.000.000-00"
          required
        />
      </FormField>

      <FormField label="Data de Nascimento" required>
        <DatePicker
          selected={form.birth_date ? new Date(form.birth_date  + 'T00:00:00') : null}
          onChange={handleDatePickerChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione uma data"
          className={styles.inputBirthDate}
          isClearable
          required
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </FormField>

      <FormField label="Plano" required>
        <Select
          options={planOptions}
          value={selectedPlan}
          onChange={handlePlanChange}
          placeholder="Selecione um plano"
          isSearchable
          isClearable
          noOptionsMessage={() => "Nenhum plano encontrado"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
          required
        />
      </FormField>

      <FormField label="Telefone">
        <IMaskInput
          mask="(00) 00000-0000"
          name="phone"
          value={form.phone}
          onAccept={value => setForm(prev => ({ ...prev, phone: value }))}
          className={styles.input}
          placeholder="(99) 99999-9999"
        />
      </FormField>

      <FormField label="E-mail" required>
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          className={styles.input} 
          type="email" 
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