import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { DoctorForm } from '../../components/Forms/DoctorForm';
import { toast } from 'react-toastify';
import type { Doctor, FormSubmissionData, DoctorFormData, TypeData, TypeDataArrays } from '../../types';

export function DoctorsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<TypeDataArrays>([]);
    const [reload, setReload] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitial, setModalInitial] = useState<TypeData | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                const base = 'http://localhost:3000';
                const res = await fetch(`${base}/api/doctors`);
                if (!res.ok) throw new Error(`Falha ao carregar doutores`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                console.error(err);
                toast.error('Erro ao carregar doutores!');
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [reload]);

    const handleFormSubmit = async (payload: FormSubmissionData) => {
        const isEdit = Boolean(modalInitial?.id);
        try {
            const base = 'http://localhost:3000';
            const url = isEdit ? `${base}/api/doctors/${modalInitial!.id}` : `${base}/api/doctors`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Falha ao salvar doutor');

            setModalOpen(false);
            setReload(r => r + 1);
            toast.success(isEdit ? 'Doutor atualizado com sucesso!' : 'Doutor criado com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar doutor!" : "Erro ao criar doutor!");
            toast.error(msg);
        }
    };

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
                            Gerenciar Doutores
                        </h1>
                        <p className={styles.listSubtitle}>
                            {data.length} doutores cadastrados
                        </p>
                        </div>
                            <button 
                                className={styles.addButton}
                                style={{ backgroundColor: '#2563EB' }}
                                onClick={() => { setModalInitial(null); setModalOpen(true); }}
                                >
                                <Plus size={20} />
                                <span>Adicionar Doutor</span>
                            </button>
                    </div>
                </div>
                <Table
                    data={data}
                    module={'doctors'}
                    lightColor={'#EFF6FF'}
                    onEdit={(item) => { setModalInitial(item as Doctor); setModalOpen(true); }}
                    onDelete={async (item) => {
                        try {
                            const base = 'http://localhost:3000';
                            const res = await fetch(`${base}/api/doctors/${item.id}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Falha ao excluir doutor');
                            setReload(r => r + 1);
                            toast.success('Doutor excluído com sucesso!');
                        } catch (error) {
                            console.error(error);
                            toast.error('Erro ao excluir doutor!');
                        }
                    }}
                />

                <Modal 
                    open={modalOpen} 
                    onClose={() => setModalOpen(false)}
                    title={`${modalInitial ? 'Editar' : 'Adicionar'} Doutor`}
                >
                    <DoctorForm
                        key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                        initial={modalInitial as DoctorFormData | null}
                        onCancel={() => setModalOpen(false)}
                        onSubmit={handleFormSubmit}
                    />
                </Modal>
            </div>
        </div>
    )
}