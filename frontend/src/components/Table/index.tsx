import { Edit2, Trash2 } from 'lucide-react';
import styles from './styles.module.css';
import type { ModuleType, TypeData } from '../../types';

interface TableProps {
  data: Array<TypeData>;
  module: ModuleType;
  lightColor?: string;
  onEdit?: (item: TypeData) => void;
  onDelete?: (item: TypeData) => void;
}

// Tipo das colunas para cada módulo
type ColumnConfig = {
  key: string;
  label: string;
  formatter?: (value: string) => string;
};

// Configuração das colunas para cada módulo
const columnsConfig: Record<ModuleType, ColumnConfig[]> = {
  doctors: [
    { key: 'created_at', label: 'Data de Criação', formatter: formatDate },
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade' },
    { key: 'crm', label: 'CRM' },
    { key: 'birth_date', label: 'Data de Nascimento', formatter: formatDate },
    { key: 'plan_names', label: 'Planos' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
  ],
  patients: [
    { key: 'created_at', label: 'Data de Criação', formatter: formatDate },
    { key: 'name', label: 'Nome' },
    { key: 'cpf', label: 'CPF', formatter: formatCPF },
    { key: 'birth_date', label: 'Data de Nascimento', formatter: formatDate },
    { key: 'plan_name', label: 'Plano' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
  ],
  plans: [
    { key: 'created_at', label: 'Data de Criação', formatter: formatDate },
    { key: 'name', label: 'Nome' },
    { key: 'code', label: 'Código' },
    { key: 'value', label: 'Valor' },
  ],
  appointments: [
    { key: 'created_at', label: 'Data de Criação', formatter: formatDate },
    { key: 'doctor_name', label: 'Doutor' },
    { key: 'patient_name', label: 'Paciente' },
    { key: 'plan_name', label: 'Plano' },
    { key: 'appointment_date', label: 'Data da Consulta', formatter: formatDate },
  ],
};

// Formatado de CPF
function formatCPF(cpf: string) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

// Formatador de Data
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function Table({ data, module, lightColor, onEdit = () => {}, onDelete = () => {} }: TableProps) {
  // Obtém as colunas a partir do módulo atual
  const columns = columnsConfig[module];
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead style={{ backgroundColor: lightColor }} className={styles.tableHead}>
          <tr>
            {/* Mapeia as colunas para renderizar o cabeçalho */}
            {columns.map(col => (
              <th key={col.key} className={styles.th}>{col.label}</th>
            ))}
            <th className={styles.th} style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Mapeia os dados para renderizar as linhas */}
          {data.map((item) => (
            <tr
              key={item.id}
              className={styles.tr}
            >

              {/* Mapeia as colunas para renderizar os dados */}
              {columns.map(col => (
                <td key={col.key} className={styles.td}>
                  {col.formatter ? col.formatter(item[col.key as keyof TypeData] as string) : String(item[col.key as keyof TypeData])}
                </td>
              ))}

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
