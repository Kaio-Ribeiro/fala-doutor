import { Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Container } from "../../components/Container";
import { PatientForm } from '../../components/Forms/PatientForm';
import type { Patient, PatientFormData } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { useDelete } from '../../hooks/useDelete';
import { useSubmit } from '../../hooks/useSubmit';

export function PatientsPage() {
    const navigate = useNavigate();
    
    // Estado para controlar a abertura e fechamento do modal
    const [modalOpen, setModalOpen] = useState(false);
    // Estado para armazenar os dados iniciais do modal
    const [modalInitial, setModalInitial] = useState<Patient | null>(null);

    // Hooks para listar, deletar e submeter os dados dos pacientes
    const { data, refetch } = useFetch<Patient[]>('/patients');
    const deleteItem = useDelete('/patients', refetch);
    const submitData = useSubmit('/patients', refetch, () => setModalOpen(false))

    // Função chamada quando o formulário é submetido
    // recebe os dados do formulário
    const handleFormSubmit = async (payload: PatientFormData) => {
        const isEdit = Boolean(modalInitial?.id);
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
                    Gerenciar Pacientes
                </h1>
                <p className={styles.listSubtitle}>
                    {data?.length || 0} pacientes cadastrados
                </p>
                </div>
                    <button 
                        className={styles.addButton}
                        style={{ backgroundColor: '#059669' }}
                        onClick={() => { setModalInitial(null); setModalOpen(true); }}
                        >
                        <Plus size={20} />
                        <span>Adicionar Paciente</span>
                    </button>
            </div>
            </div>
            <Table
                data={data || []}
                module={'patients'}
                lightColor={'#ECFDF5'}
                onEdit={(item) => { setModalInitial(item as Patient); setModalOpen(true); }}
                onDelete={deleteItem}
            />

            <Modal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)}
                title={`${modalInitial ? 'Editar' : 'Adicionar'} Paciente`}
            >
                <PatientForm
                    key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                    initial={modalInitial as PatientFormData | null}
                    onCancel={() => setModalOpen(false)}
                    onSubmit={handleFormSubmit}
                />
            </Modal>
        </Container>
    )
}