import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    const [data, setData] = useState<Doctor[] | Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0);

    const mainColor = isDoctors ? '#2563EB' : '#059669';
    const lightColor = isDoctors ? '#EFF6FF' : '#ECFDF5';

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const base = 'http://localhost:3000';
                const res = await fetch(`${base}/api/${selectedModule}`);
                if (!res.ok) throw new Error(`Failed to fetch ${selectedModule}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                if (!cancelled) setError(String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [selectedModule, reload]);

    if (loading) {
        return (
            <div className={styles.listContainer}>
                <div className={styles.listContent}>
                    <div className={styles.listHeader}>
                        <p>Carregando {isDoctors ? 'médicos' : 'pacientes'}...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.listContainer}>
                <div className={styles.listContent}>
                    <div className={styles.listHeader}>
                        <p style={{ color: 'red', marginBottom: 8 }}>Erro: {error}</p>
                        <button
                            className={styles.addButton}
                            onClick={() => setReload(r => r + 1)}
                            style={{ backgroundColor: mainColor }}
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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