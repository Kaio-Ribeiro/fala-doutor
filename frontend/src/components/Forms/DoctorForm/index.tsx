import React, { useState, useEffect } from 'react';
import { IMaskInput } from "react-imask";
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';

interface Plan {
  id?: number;
  name: string;
  code?: string;
  value?: string;
}

interface DoctorFormData {
  id?: number;
  name: string;
  specialty?: string;
  crm: string;
  birth_date?: string;
  phone?: string;
  email: string;
  plan_ids: number[];
}

interface Props {
  initial?: DoctorFormData | null;
  onCancel: () => void;
  onSubmit: (data: DoctorFormData) => void;
}

const specialties = [
  'Cardiologia',
  'Dermatologia', 
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia e Obstetrícia',
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

export function DoctorForm({ initial = null, onCancel, onSubmit }: Props) {
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

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/plans');
        if (!res.ok) throw new Error('Falha ao buscar planos');
        const json = await res.json();
        if (!cancelled) setPlans(json);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar planos!');
      }
    };
    fetchPlans();
    return () => { cancelled = true; };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    let newValue: string | number | string[] = value;
    if (name === 'birth_date') {
      newValue = value ? value.slice(0,10) : ''
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  }

  function handleSpecialtyChange(selectedOption: { value: string; label: string } | null) {
    setForm(prev => ({ ...prev, specialty: selectedOption?.value || '' }));
  }

  function handlePlansChange(selectedOptions: readonly { value?: number; label: string }[] | null) {
    const planIds = selectedOptions ? 
      selectedOptions.map(option => option.value).filter((id): id is number => id !== undefined) : 
      [];
    setForm(prev => ({ ...prev, plan_ids: planIds }));
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

  const planOptions = plans.map(plan => ({
    value: plan.id,
    label: plan.name
  }));

  const specialtyOptions = specialties.map(specialty => ({
    value: specialty,
    label: specialty
  }));

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
        <input 
          name="birth_date" 
          value={form.birth_date} 
          onChange={handleChange} 
          className={styles.input} 
          type="date"
          required 
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