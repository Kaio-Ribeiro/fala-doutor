import React, { useState } from 'react';
import { IMaskInput } from "react-imask";
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';
import { DatePicker } from 'react-datepicker';
import type { DoctorFormData, Plan } from '../../../types';
import { useFetch } from '../../../hooks/useFetch';

interface Props {
  initial?: DoctorFormData | null;
  onCancel: () => void;
  onSubmit: (data: DoctorFormData) => void;
}

// Lista de especialidades pré-definidas
const specialties = [
  'Cardiologia',
  'Dermatologia', 
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Urologia',
  'Medicina Geral',
  'Clínica Médica',
  'Cirurgia Geral',
  'Anestesiologia',
  'Radiologia'
];

// Limite de idade do doutor de 18 anos
const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

export function DoctorForm({ initial = null, onCancel, onSubmit }: Props) {
  // Estado inicial do formulário
  // preenchido com os dados do doutor a ser editado (se houver)
  const [form, setForm] = useState<DoctorFormData>(() => {
    return {
      name: '',
      specialty: '',
      crm: '',
      phone: '',
      email: '',
      plan_ids: [],
      ...initial,
      birth_date: initial?.birth_date?.slice(0,10) || ''
    }
  });

  // Estado para controlar se o formulário está sendo submetido
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usa hook para buscar os planos disponíveis e preencher o select
  const { data } = useFetch<Plan[]>('/plans');

  // Lida com mudanças em campos do formulário
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Lida com mudanças no DatePicker para a data de nascimento
  function handleDatePickerChange(date: Date | null) {
    // Se houver uma data selecionada, formata para string no formato YYYY-MM-DD
    // Caso contrário, limpa o campo
    if (date) {
      const formattedDate = date.toISOString().slice(0, 10);
      setForm(prev => ({ ...prev, birth_date: formattedDate }));
    } else {
      setForm(prev => ({ ...prev, birth_date: '' }));
    }
  }

  // Lida com mudanças no Select de especialidade
  function handleSpecialtyChange(selectedOption: { value: string; label: string } | null) {
    setForm(prev => ({ ...prev, specialty: selectedOption?.value || '' }));
  }

  // Lida com mudanças no Select de planos
  // É permitido selecionar múltiplos planos, então o valor é um array de IDs
  function handlePlansChange(selectedOptions: readonly { value?: number; label: string }[] | null) {
    const planIds = selectedOptions ? 
      selectedOptions.map(option => option.value).filter((value): value is number => value !== undefined) : 
      [];
    setForm(prev => ({ ...prev, plan_ids: planIds }));
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

  // planOptions e specialtyOptions são formatados dessa forma
  // para serem usados nos Selects do react-select
  const planOptions = data?.map(plan => ({
    value: plan.id,
    label: plan.name
  })) || [];

  const specialtyOptions = specialties.map(specialty => ({
    value: specialty,
    label: specialty
  }));

  // selectedSpecialty e selectedPlans são usados para mostrar os valores selecionados nos Selects
  const selectedSpecialty = specialtyOptions.find(option => option.value === form.specialty) || null;
  const selectedPlans = planOptions.filter(option => 
    option.value !== undefined && form.plan_ids.includes(option.value)
  );

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

      <FormField label="Especialidade">
        <Select
          options={specialtyOptions}
          value={selectedSpecialty}
          onChange={handleSpecialtyChange}
          placeholder="Selecione uma especialidade"
          isSearchable
          isClearable
          noOptionsMessage={() => "Nenhuma especialidade encontrada"}
          className={styles.reactSelect}
          classNamePrefix="react-select"
        />
      </FormField>

      <FormField label="CRM" required>
        <input 
          name="crm" 
          value={form.crm} 
          onChange={handleChange} 
          className={styles.input} 
          placeholder="CRM/CE 123456"
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
          maxDate={eighteenYearsAgo}
          isClearable
          required
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </FormField>

      <FormField label="Planos" required>
        <Select
          options={planOptions}
          value={selectedPlans}
          onChange={handlePlansChange}
          placeholder="Selecione os planos"
          isSearchable
          isMulti
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