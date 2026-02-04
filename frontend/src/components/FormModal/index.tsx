import React from 'react';
import { Modal } from '../Modal';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title={title}>
      {children}
    </Modal>
  );
}