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
}

interface PatientFormData {
  id?: number;
  name: string;
  cpf: string;
  phone?: string;
  email: string;
  plan_id?: number;
}

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
    ...initial
  }));

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
    setForm(prev => ({ ...prev, [name]: value }));
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

  const planOptions = plans.map(plan => ({
    value: plan.id,
    label: plan.name
  }));

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