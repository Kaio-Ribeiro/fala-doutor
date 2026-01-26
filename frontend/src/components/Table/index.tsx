import { Edit2, Trash2 } from 'lucide-react';
import styles from './styles.module.css';

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  crm: string;
  phone: string;
  email: string;
}

type Patient = {
  id: number;
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
}

interface TableProps {
  data: Array<Doctor | Patient>;
  isDoctors: boolean;
  lightColor?: string;
  onEdit?: (item: Doctor | Patient) => void;
  onDelete?: (item: Doctor | Patient) => void;
}

export function Table({ data, isDoctors, lightColor, onEdit = () => {}, onDelete = () => {} }: TableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead style={{ backgroundColor: lightColor }} className={styles.tableHead}>
          <tr>
            {isDoctors ? (
              <>
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>Especialidade</th>
                <th className={styles.th}>CRM</th>
                <th className={styles.th}>Telefone</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th} style={{ textAlign: 'center' }}>Ações</th>
              </>
            ) : (
              <>
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>CPF</th>
                <th className={styles.th}>Data Nasc.</th>
                <th className={styles.th}>Telefone</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th} style={{ textAlign: 'center' }}>Ações</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={styles.tr}
            >
              <td className={styles.tdName}>{item.name}</td>
              {isDoctors ? (
                <>
                  <td className={styles.td}>{(item as Doctor).specialty}</td>
                  <td className={styles.td}>{(item as Doctor).crm}</td>
                </>
              ) : (
                <>
                  <td className={styles.td}>{(item as Patient).cpf}</td>
                  <td className={styles.td}>{new Date((item as Patient).birth_date).toLocaleDateString('pt-BR')}</td>
                </>
              )}
              <td className={styles.td}>{item.phone}</td>
              <td className={styles.td}>{item.email}</td>
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
