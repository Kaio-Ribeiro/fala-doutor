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
  // Estado para controlar os dados do formulário
  const [form, setForm] = useState<PatientFormData>(() => ({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    plan_id: undefined,
    ...initial,
    birth_date: initial?.birth_date?.slice(0,10) || ''
  }));

  // Estado para controlar se a submissão está sendo feita
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook que faz a requisição da lista de planos
  const { data } = useFetch<Plan[]>('/plans');

  // Função para lidar com as mudanças nos campos de input
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Função para lidar com a mudança no date picker
  function handleDatePickerChange(date: Date | null) {
    // Se houver uma data selecionada, pega apenas a parte da data sem o horário
    if (date) {
      const formattedDate = date.toISOString().slice(0, 10);
      setForm(prev => ({ ...prev, birth_date: formattedDate }));
    } else {
      setForm(prev => ({ ...prev, birth_date: '' }));
    }
  }

  // Função para lidar com a mudança no select de planos
  function handlePlanChange(selectedOption: { value?: number; label: string } | null) {
    setForm(prev => ({ ...prev, plan_id: selectedOption?.value || undefined }));
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

  // Mapeia os planos para o formato esperado pelo react-select
  const planOptions = data?.map(plan => ({
    value: plan.id,
    label: plan.name
  })) || [];

  // Encontra o plano selecionado com base no plan_id do formulário
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