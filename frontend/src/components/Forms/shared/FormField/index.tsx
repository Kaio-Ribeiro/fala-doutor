import React from 'react';
import styles from './styles.module.css';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, required = false, children }: FormFieldProps) {
  return (
    <div className={styles.row}>
      <label className={styles.label}>
        {label} {required && '*'}
      </label>
      {children}
    </div>
  );
}