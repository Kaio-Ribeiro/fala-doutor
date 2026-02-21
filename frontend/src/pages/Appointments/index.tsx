import { Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { AppointmentForm } from '../../components/Forms/AppointmentForm';
import { Container } from "../../components/Container";
import { toast } from 'react-toastify';
import type { Appointment, AppointmentFormData, FormSubmissionData } from '../../types';
import { useFetch} from '../../hooks/useFetch';
import { useDelete } from '../../hooks/useDelete'

export function AppointmentsPage() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitial, setModalInitial] = useState<Appointment | null>(null);
    const { data, refetch } = useFetch<Appointment[]>('/appointments');
    const deleteItem = useDelete('/appointments', refetch)

    const handleFormSubmit = async (payload: FormSubmissionData) => {
        const isEdit = Boolean(modalInitial?.id);
        try {
            const base = 'http://localhost:3000';
            const url = isEdit ? `${base}/api/appointments/${modalInitial!.id}` : `${base}/api/appointments`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Falha ao salvar consulta');

            setModalOpen(false);
            refetch();
            toast.success(isEdit ? 'Consulta atualizada com sucesso!' : 'Consulta criada com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar consulta!" : "Erro ao criar consulta!");
            toast.error(msg);
        }
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
                    Gerenciar Consultas
                </h1>
                <p className={styles.listSubtitle}>
                    {data?.length || 0} consultas cadastradas
                </p>
                </div>
                    <button 
                        className={styles.addButton}
                        style={{ backgroundColor: '#D97706' }}
                        onClick={() => { setModalInitial(null); setModalOpen(true); }}
                        >
                        <Plus size={20} />
                        <span>Adicionar Consulta</span>
                    </button>
            </div>
            </div>
            <Table
                data={data || []}
                module={'appointments'}
                lightColor={'#FEF3C7'}
                onEdit={(item) => { setModalInitial(item as Appointment); setModalOpen(true); }}
                onDelete={deleteItem}
            />

            <Modal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)}
                title={`${modalInitial ? 'Editar' : 'Adicionar'} Consulta`}
            >
                <AppointmentForm
                    key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                    initial={modalInitial as AppointmentFormData | null}
                    onCancel={() => setModalOpen(false)}
                    onSubmit={handleFormSubmit}
                />
            </Modal>
        </Container>
    )
}