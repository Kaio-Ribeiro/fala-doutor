import React from 'react';
import styles from './styles.module.css';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
