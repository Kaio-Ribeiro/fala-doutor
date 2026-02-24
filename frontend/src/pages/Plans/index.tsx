import { Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { PlanForm } from '../../components/Forms/PlanForm';
import { Container } from "../../components/Container";
import type { Plan, PlanFormData } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { useDelete } from '../../hooks/useDelete';
import { useSubmit } from '../../hooks/useSubmit';

export function PlansPage() {
    const navigate = useNavigate();

    // Estado para controlar a abertura e o fechamento do modal
    const [modalOpen, setModalOpen] = useState(false);
    // Estado para armazenar os dados iniciais do modal
    const [modalInitial, setModalInitial] = useState<Plan | null>(null);

    // Hooks para listar, deletar e submeter os dados dos planos
    const { data, refetch } = useFetch<Plan[]>('/plans');
    const deleteItem = useDelete('/plans', refetch)
    const submitData = useSubmit('/plans', refetch, () => setModalOpen(false))

    // Função chamada quando o formulário é submetido 
    // recebe os dados do formulário
    const handleFormSubmit = async (payload: PlanFormData) => {
        const isEdit = Boolean(modalInitial?.id);
        submitData(isEdit, modalInitial?.id, payload)
    };

    return (
        <Container>
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
                    {data?.length || 0} planos cadastrados
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
                data={data || []}
                module={'plans'}
                lightColor={'#F3E8FF'}
                onEdit={(item) => { setModalInitial(item as Plan); setModalOpen(true); }}
                onDelete={deleteItem}
            />

            <Modal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)}
                title={`${modalInitial ? 'Editar' : 'Adicionar'} Plano`}
            >
                <PlanForm
                    key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                    initial={modalInitial as PlanFormData | null}
                    onCancel={() => setModalOpen(false)}
                    onSubmit={handleFormSubmit}
                />
            </Modal>
        </Container>
    )
}