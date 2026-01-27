import { Plus, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { Table } from '../../components/Table';

type ModuleType = 'doctors' | 'patients';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    crm: string;
    phone: string;
    email: string;
}

interface Patient {
    id: number;
    name: string;
    cpf: string;
    birth_date: string;
    phone: string;
    email: string;
}

export function ListPage() {
    const params = useParams();
    const navigate = useNavigate();
    const moduleParam = params.module as ModuleType | undefined;

    const selectedModule: ModuleType = moduleParam ?? 'doctors';

    const isDoctors = selectedModule === 'doctors';
    const data = isDoctors ? ([] as Doctor[]) : ([] as Patient[]);
    const mainColor = isDoctors ? '#2563EB' : '#059669';
    const lightColor = isDoctors ? '#EFF6FF' : '#ECFDF5';

    return (
        <div className={styles.listContainer}>
            <div className={styles.listContent}>
                <div className={styles.listHeader}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} className={styles.backIcon} />
                    Voltar
                </button>
                <div className={styles.listHeaderContent}>
                    <div>
                    <h1 className={styles.listTitle}>
                        {isDoctors ? 'Gerenciar Doutores' : 'Gerenciar Pacientes'}
                    </h1>
                    <p className={styles.listSubtitle}>
                        {data.length} {isDoctors ? 'médicos' : 'pacientes'} cadastrados
                    </p>
                    </div>
                    <button 
                    className={styles.addButton}
                    style={{ backgroundColor: mainColor }}
                    >
                    <Plus size={20} />
                    <span>Adicionar {isDoctors ? 'Doutor' : 'Paciente'}</span>
                    </button>
                </div>
                </div>

                <Table data={data} isDoctors={isDoctors} lightColor={lightColor} onEdit={() => {}} onDelete={() => {}} />
            </div>
        </div>
    )
}