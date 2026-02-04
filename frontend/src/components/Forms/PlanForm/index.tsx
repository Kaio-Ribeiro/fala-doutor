import React, { useState } from 'react';
import { FormField } from '../shared/FormField';
import { FormActions } from '../shared/FormActions';
import styles from '../shared/styles.module.css';

interface PlanFormData {
  id?: number;
  name: string;
  code: string;
  value: string;
}

interface Props {
  initial?: PlanFormData | null;
  onCancel: () => void;
  onSubmit: (data: PlanFormData) => void;
}

export function PlanForm({ initial = null, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<PlanFormData>(() => ({
    name: '',
    code: '',
    value: '',
    ...initial
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

      <FormField label="Código" required>
        <input 
          name="code" 
          value={form.code} 
          onChange={handleChange} 
          className={styles.input} 
          required 
        />
      </FormField>

      <FormField label="Valor" required>
        <input 
          name="value" 
          value={form.value} 
          onChange={handleChange} 
          className={styles.input} 
          type="number"
          min="0"
          step="0.01"
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