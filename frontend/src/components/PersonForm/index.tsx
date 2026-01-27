import React, { useState } from 'react';
import styles from './styles.module.css';

type ModuleType = 'doctors' | 'patients';

interface Doctor {
  id?: number;
  name: string;
  specialty?: string;
  crm?: string;
  phone: string;
  email: string;
}

interface Patient {
  id?: number;
  name: string;
  cpf?: string;
  birth_date?: string;
  phone: string;
  email: string;
}

interface Props {
  mode: ModuleType;
  initial?: Doctor | Patient | null;
  onCancel: () => void;
  onSubmit: (data: FormState) => void;
}

interface FormState {
  id?: number;
  name: string;
  specialty?: string;
  crm?: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
}

export function PersonForm({ mode, initial = null, onCancel, onSubmit }: Props) {
  const isDoctors = mode === 'doctors';

  const defaultForm: FormState = {
    name: '',
    specialty: '',
    crm: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: '',
  };

  const [form, setForm] = useState<FormState>(() => ({ ...defaultForm, ...(initial as Partial<FormState> || {}) }));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const key = name as keyof FormState;
    setForm((s) => ({ ...s, [key]: value } as FormState));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.row}>
        <label className={styles.label}>Nome</label>
        <input name="name" value={form.name} onChange={handleChange} className={styles.input} required />
      </div>

      {isDoctors ? (
        <>
          <div className={styles.row}>
            <label className={styles.label}>Especialidade</label>
            <input name="specialty" value={form.specialty} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>CRM</label>
            <input name="crm" value={form.crm} onChange={handleChange} className={styles.input} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.row}>
            <label className={styles.label}>CPF</label>
            <input name="cpf" value={form.cpf} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Data Nasc.</label>
            <input name="birth_date" value={form.birth_date} onChange={handleChange} className={styles.input} type="date" />
          </div>
        </>
      )}

      <div className={styles.row}>
        <label className={styles.label}>Telefone</label>
        <input name="phone" value={form.phone} onChange={handleChange} className={styles.input} />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>Email</label>
        <input name="email" value={form.email} onChange={handleChange} className={styles.input} type="email" />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.submit}>Salvar</button>
      </div>
    </form>
  );
}

export default PersonForm;
