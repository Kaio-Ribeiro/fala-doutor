import styles from './styles.module.css';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  isSubmitting = false
}: FormActionsProps) {
  return (
    <div className={styles.actions}>
      <button 
        type="button" 
        className={styles.cancel} 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelText}
      </button>
      <button 
        type={onSubmit ? "button" : "submit"}
        className={styles.submit}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : submitText}
      </button>
    </div>
  );
}