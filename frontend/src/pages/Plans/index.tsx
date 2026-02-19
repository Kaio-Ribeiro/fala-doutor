import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { FormModal } from '../../components/FormModal';
import { PlanForm } from '../../components/Forms/PlanForm';
import { toast } from 'react-toastify';
import type { Plan, FormSubmissionData, TypeData, TypeDataArrays } from '../../types';
import type { PlanFormData } from '../../types';

export function PlansPage() {
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
                const res = await fetch(`${base}/api/plans`);
                if (!res.ok) throw new Error(`Falha ao carregar planos`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                console.error(err);
                toast.error('Erro ao carregar planos!');
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [reload]);

    const handleFormSubmit = async (payload: FormSubmissionData) => {
        const isEdit = Boolean(modalInitial?.id);
        try {
            const base = 'http://localhost:3000';
            const url = isEdit ? `${base}/api/plans/${modalInitial!.id}` : `${base}/api/plans`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Falha ao salvar plano');

            setModalOpen(false);
            setReload(r => r + 1);
            toast.success(isEdit ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar plano!" : "Erro ao criar plano!");
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
                        Gerenciar Planos
                    </h1>
                    <p className={styles.listSubtitle}>
                        {data.length} planos cadastrados
                    </p>
                    </div>
                        <button 
                            className={styles.addButton}
                            style={{ backgroundColor: '#A21CAF' }}
                            onClick={() => { setModalInitial(null); setModalOpen(true); }}
                            >
                            <Plus size={20} />
                            <span>Adicionar Plano</span>
                        </button>
                </div>
                </div>
                <Table
                    data={data}
                    module={'plans'}
                    lightColor={'#F3E8FF'}
                    onEdit={(item) => { setModalInitial(item as Plan); setModalOpen(true); }}
                    onDelete={async (item) => {
                        try {
                            const base = 'http://localhost:3000';
                            const res = await fetch(`${base}/api/plans/${item.id}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Falha ao excluir plano');
                            setReload(r => r + 1);
                            toast.success('Plano excluído com sucesso!');
                        } catch (error) {
                            console.error(error);
                            toast.error('Erro ao excluir plano!');
                        }
                    }}
                />

                <FormModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)}
                    title={`${modalInitial ? 'Editar' : 'Adicionar'} Plano`}
                >
                    <PlanForm
                        key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                        initial={modalInitial as PlanFormData | null}
                        onCancel={() => setModalOpen(false)}
                        onSubmit={handleFormSubmit}
                    />
                </FormModal>
            </div>
        </div>
    )
}