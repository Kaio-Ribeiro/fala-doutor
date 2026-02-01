import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { IMaskInput } from "react-imask";
import { toast } from 'react-toastify';

type ModuleType = 'doctors' | 'patients' | 'plans';

interface Doctor {
  id?: number;
  name: string;
  specialty?: string;
  crm?: string;
  phone?: string;
  email: string;
}

interface Patient {
  id?: number;
  name: string;
  cpf?: string;
  phone?: string;
  email: string;
}

interface Plan {
  id?: number;
  name: string;
  code?: string;
  value?: string;
}

interface Props {
  module: ModuleType;
  initial?: Doctor | Patient | Plan | null;
  onCancel: () => void;
  onSubmit: (data: FormState) => void;
}

interface FormState {
  id?: number;
  name: string;
  specialty?: string;
  crm?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  code?: string;
  value?: string;
  plan_id?: number;
  plan_name?: number;
}

export function PersonForm({ module, initial = null, onCancel, onSubmit }: Props) {
  const defaultForm: FormState = {
    name: '',
    specialty: '',
    crm: '',
    cpf: '',
    phone: '',
    email: '',
    code: '',
    value: '',
    plan_id: undefined,
    plan_name: undefined
  };

  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (module !== 'doctors' && module !== 'patients') return;

    let cancelled = false;
    const fetchData = async () => {
      try {
          const res = await fetch('http://localhost:3000/api/plans');
          if (!res.ok) throw new Error(`Falha ao listar ${module}`);
          const json = await res.json();
          if (!cancelled) setPlans(json);
      } catch (err) {
          console.error(err);
          toast.error('Erro ao carregar planos!');
      }
    };
      fetchData();
      return () => { cancelled = true; };
  }, [module]);


  const [form, setForm] = useState<FormState>(() => ({ ...defaultForm, ...(initial as Partial<FormState> || {}) }));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const key = name as keyof FormState;
    setForm((s) => ({ ...s, [key]: value } as FormState));
  }

  function handlePlanSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    setForm(s => ({ ...s, plan_id: value ? Number(value) : undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.row}>
        <label className={styles.label}>Nome *</label>
        <input name="name" value={form.name} onChange={handleChange} className={styles.input} required />
      </div>

      {module === 'doctors' && (
        <>
          <div className={styles.row}>
            <label className={styles.label}>Especialidade</label>
            <input name="specialty" value={form.specialty} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>CRM *</label>
            <input name="crm" value={form.crm} onChange={handleChange} className={styles.input} required placeholder="CRM/CE 123456" />
          </div>
        </>
      )}

      {module === 'patients' && (
        <>
          <div className={styles.row}>
            <label className={styles.label}>CPF *</label>
            <IMaskInput 
              mask="000.000.000-00" 
              name="cpf" 
              unmask={true}
              value={form.cpf}
              onAccept={(value) => setForm((s) => ({ ...s, cpf: value }))}
              className={styles.input}
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Plano *</label>
            <select 
              value={form.plan_id?.toString() || ''} 
              onChange={handlePlanSelect}
              className={styles.input}
              required
            >
              <option value="">Selecione um plano</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id?.toString()}>{plan.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {module === 'plans' && (
        <>
          <div className={styles.row}>
            <label className={styles.label}>Código *</label>
            <input name="code" value={form.code} onChange={handleChange} className={styles.input} required />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Valor *</label>
            <input name="value" value={form.value} onChange={handleChange} className={styles.input} required />
          </div>
        </>
      )}

      {module !== 'plans' && (
        <>
          <div className={styles.row}>
            <label className={styles.label}>Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              name="phone"
              value={form.phone}
              onAccept={value => setForm(s => ({ ...s, phone: value }))}
              className={styles.input}
              placeholder="(99) 99999-9999"
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>E-mail *</label>
            <input name="email" value={form.email} onChange={handleChange} className={styles.input} type="email" required/>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.submit}>Salvar</button>
      </div>
    </form>
  );
}

export default PersonForm;
