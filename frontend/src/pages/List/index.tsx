import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { PersonForm } from '../../components/PersonForm';
import { toast } from 'react-toastify';

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
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitial, setModalInitial] = useState<Doctor | Patient | null>(null);

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
                            onClick={() => { setModalInitial(null); setModalOpen(true); }}
                            >
                            <Plus size={20} />
                            <span>Adicionar {isDoctors ? 'Doutor' : 'Paciente'}</span>
                        </button>
                </div>
                </div>
                <Table
                    data={data}
                    isDoctors={isDoctors}
                    lightColor={lightColor}
                    onEdit={(item) => { setModalInitial(item as Doctor | Patient); setModalOpen(true); }}
                    onDelete={async (item) => {
                        try {
                            const base = 'http://localhost:3000';
                            const res = await fetch(`${base}/api/${selectedModule}/${item.id}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Failed to delete');
                            setReload(r => r + 1);
                            toast.success('Excluído com sucesso!');
                        } catch (e) {
                            console.error(e);
                            toast.error('Erro ao excluir!');
                        }
                    }}
                />

                <Modal open={modalOpen} title={modalInitial ? 'Editar' : 'Adicionar'} onClose={() => setModalOpen(false)}>
                    <PersonForm
                        key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                        mode={selectedModule}
                        initial={modalInitial}
                        onCancel={() => setModalOpen(false)}
                        onSubmit={async (payload) => {
                            const isEdit = Boolean(modalInitial?.id);
                            try {
                                const base = 'http://localhost:3000';
                                const url = isEdit ? `${base}/api/${selectedModule}/${modalInitial!.id}` : `${base}/api/${selectedModule}`;
                                const method = isEdit ? 'PUT' : 'POST';
                                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                if (!res.ok) throw new Error('Failed to save');
                                setModalOpen(false);
                                setReload(r => r + 1);
                                toast.success(isEdit ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
                            } catch (e) {
                                console.error(e);
                                toast.error(isEdit ? 'Erro ao atualizar!' : 'Erro ao criar!');
                            }
                        }}
                    />
                </Modal>
            </div>
        </div>
    )
}