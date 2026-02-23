import { Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Container } from "../../components/Container";
import { DoctorForm } from '../../components/Forms/DoctorForm';
import type { Doctor, DoctorFormData } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { useDelete } from '../../hooks/useDelete';
import { useSubmit } from '../../hooks/useSubmit';

export function DoctorsPage() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);

    // Dados iniciais do modal
    const [modalInitial, setModalInitial] = useState<Doctor | null>(null);

    // Hooks para listar os doutores, deletar e submeter
    const { data, refetch } = useFetch<Doctor[]>('/doctors');
    const deleteItem = useDelete('/doctors', refetch);
    const submitData = useSubmit('/doctors', refetch, () => setModalOpen(false))

    // handleFormSubmit é chamado pelo onSubmit do DoctorForm
    // Recebe os dados do formulário para criação ou edição
    const handleFormSubmit = async (payload: DoctorFormData) => {
        const isEdit = Boolean(modalInitial?.id)
        // Chama o hook de submit passando se é edição, o id (se houver) e os dados do formulário
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
                            Gerenciar Doutores
                        </h1>
                        <p className={styles.listSubtitle}>
                            {data?.length || 0} doutores cadastrados
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
                data={data || []}
                module={'doctors'}
                lightColor={'#EFF6FF'}
                onEdit={(item) => { setModalInitial(item as Doctor); setModalOpen(true); }}
                onDelete={deleteItem}
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
        </Container>
    )
}