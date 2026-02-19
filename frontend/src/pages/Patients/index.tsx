import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.css';
import { Table } from '../../components/Table';
import { FormModal } from '../../components/FormModal';
import { PatientForm } from '../../components/Forms/PatientForm';
import { toast } from 'react-toastify';
import type { Patient, PatientFormData, FormSubmissionData, TypeData, TypeDataArrays } from '../../types';

export function PatientsPage() {
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
                const res = await fetch(`${base}/api/patients`);
                if (!res.ok) throw new Error(`Falha ao carregar pacientes`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                console.error(err);
                toast.error('Erro ao carregar pacientes!');
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [reload]);

    const handleFormSubmit = async (payload: FormSubmissionData) => {
        const isEdit = Boolean(modalInitial?.id);
        try {
            const base = 'http://localhost:3000';
            const url = isEdit ? `${base}/api/patients/${modalInitial!.id}` : `${base}/api/patients`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Falha ao salvar paciente');

            setModalOpen(false);
            setReload(r => r + 1);
            toast.success(isEdit ? 'Paciente atualizado com sucesso!' : 'Paciente criado com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar paciente!" : "Erro ao criar paciente!");
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
                        Gerenciar Pacientes
                    </h1>
                    <p className={styles.listSubtitle}>
                        {data.length} pacientes cadastrados
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
                    data={data}
                    module={'patients'}
                    lightColor={'#ECFDF5'}
                    onEdit={(item) => { setModalInitial(item as Patient); setModalOpen(true); }}
                    onDelete={async (item) => {
                        try {
                            const base = 'http://localhost:3000';
                            const res = await fetch(`${base}/api/patients/${item.id}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Falha ao excluir paciente');
                            setReload(r => r + 1);
                            toast.success('Paciente excluído com sucesso!');
                        } catch (error) {
                            console.error(error);
                            toast.error('Erro ao excluir paciente!');
                        }
                    }}
                />

                <FormModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)}
                    title={`${modalInitial ? 'Editar' : 'Adicionar'} Paciente`}
                >
                    <PatientForm
                        key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                        initial={modalInitial as PatientFormData | null}
                        onCancel={() => setModalOpen(false)}
                        onSubmit={handleFormSubmit}
                    />
                </FormModal>
            </div>
        </div>
    )
}