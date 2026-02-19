import { Edit2, Trash2 } from 'lucide-react';
import styles from './styles.module.css';
import type { Doctor, Patient, Plan, Appointment, ModuleType, TypeData } from '../../types';

interface TableProps {
  data: Array<TypeData>;
  module: ModuleType;
  lightColor?: string;
  onEdit?: (item: TypeData) => void;
  onDelete?: (item: TypeData) => void;
}

const columnsConfig = {
  doctors: [
    { key: 'created_at', label: 'Data de Criação' },
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade' },
    { key: 'crm', label: 'CRM' },
    { key: 'birth_date', label: 'Data de Nascimento' },
    { key: 'plan_names', label: 'Planos' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
  ],
  patients: [
    { key: 'created_at', label: 'Data de Criação' },
    { key: 'name', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'birth_date', label: 'Data de Nascimento' },
    { key: 'plan_name', label: 'Plano' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
  ],
  plans: [
    { key: 'created_at', label: 'Data de Criação' },
    { key: 'name', label: 'Nome' },
    { key: 'code', label: 'Código' },
    { key: 'value', label: 'Valor' },
  ],
  appointments: [
    { key: 'created_at', label: 'Data de Criação' },
    { key: 'doctor_name', label: 'Doutor' },
    { key: 'patient_name', label: 'Paciente' },
    { key: 'plan_name', label: 'Plano' },
    { key: 'appointment_date', label: 'Data da Consulta' },
  ],
};

function formatCPF(cpf: string) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function Table({ data, module, lightColor, onEdit = () => {}, onDelete = () => {} }: TableProps) {
  const columns = columnsConfig[module];
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead style={{ backgroundColor: lightColor }} className={styles.tableHead}>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={styles.th}>{col.label}</th>
            ))}
            <th className={styles.th} style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={styles.tr}
            >
              <td className={styles.td}>{new Date(item.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
              {module === 'doctors' && (
                <>
                  <td className={styles.tdName}>{(item as Doctor).name}</td>
                  <td className={styles.td}>{(item as Doctor).specialty}</td>
                  <td className={styles.td}>{(item as Doctor).crm}</td>
                  <td className={styles.td}>{new Date((item as Doctor).birth_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                  <td className={styles.td}>{(item as Doctor).plan_names}</td>
                </>
              )}

              {module === 'patients' && (
                <>
                  <td className={styles.tdName}>{(item as Patient).name}</td>
                  <td className={styles.td}>{formatCPF((item as Patient).cpf)}</td>
                  <td className={styles.td}>{new Date((item as Patient).birth_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                  <td className={styles.td}>{(item as Patient).plan_name}</td>
                </>
              )}

              {module === 'plans' && (
                <>
                  <td className={styles.tdName}>{(item as Plan).name}</td>
                  <td className={styles.td}>{(item as Plan).code}</td>
                  <td className={styles.td}>{(item as Plan).value}</td>
                </>
              )}

              {module === 'appointments' && (
                <>
                  <td className={styles.tdName}>{(item as Appointment).doctor_name}</td>
                  <td className={styles.td}>{(item as Appointment).patient_name}</td>
                  <td className={styles.td}>{(item as Appointment).plan_name}</td>
                  <td className={styles.td}>{new Date((item as Appointment).appointment_date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                </>
              )}

              {module !== 'plans' && module !== 'appointments' && (
                <>
                  <td className={styles.td}>{('phone' in item ? item.phone : '')}</td>
                  <td className={styles.td}>{('email' in item ? item.email : '')}</td>
                </>
              )}

              <td className={styles.tdActions}>
                    <div className={styles.actionsContainer}>
                      <button
                        className={styles.editButton}
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
