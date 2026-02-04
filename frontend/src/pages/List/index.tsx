import { Plus, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { Table } from '../../components/Table';
import { FormModal } from '../../components/FormModal';
import { DoctorForm } from '../../components/Forms/DoctorForm';
import { PatientForm } from '../../components/Forms/PatientForm';
import { PlanForm } from '../../components/Forms/PlanForm';
import { AppointmentForm } from '../../components/Forms/AppointmentForm';
import { toast } from 'react-toastify';

type ModuleType = 'doctors' | 'patients'| 'plans' | 'appointments';

const moduleConfig = {
  doctors: {
    mainColor: '#2563EB',
    lightColor: '#EFF6FF',
    title: 'Gerenciar Doutores',
    singularTitle: 'Doutor',
    subtitle: (count: number) => `${count} médicos cadastrados`,
    addLabel: 'Adicionar Doutor',
  },
  patients: {
    mainColor: '#059669',
    lightColor: '#ECFDF5',
    title: 'Gerenciar Pacientes',
    singularTitle: 'Paciente',
    subtitle: (count: number) => `${count} pacientes cadastrados`,
    addLabel: 'Adicionar Paciente',
  },
  plans: {
    mainColor: '#A21CAF',
    lightColor: '#F3E8FF',
    title: 'Gerenciar Planos',
    singularTitle: 'Plano',
    subtitle: (count: number) => `${count} planos cadastrados`,
    addLabel: 'Adicionar Plano',
  },
  appointments: {
    mainColor: '#D97706',
    lightColor: '#FEF3C7',
    title: 'Gerenciar Consultas',
    singularTitle: 'Consulta',
    subtitle: (count: number) => `${count} consultas cadastradas`,
    addLabel: 'Adicionar Consulta',
  },
} as const;

interface Doctor {
    id: number;
    created_at: string;
    name: string;
    specialty: string;
    crm: string;
    phone: string;
    email: string;
    plan_names?: string;
    plan_ids?: number[];
}

interface Patient {
    id: number;
    created_at: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    plan_id: number;
    plan_name: string;
}

interface Plan {
    id: number;
    created_at: string;
    name: string;
    code: string;
    value: string;
}

interface Appointment {
    id: number;
    doctor_name: string;
    patient_name: string;
    created_at: string;
    appointment_date: string;
}

// Types for form submissions
type DoctorFormData = {
    id?: number;
    name: string;
    specialty?: string;
    crm: string;
    phone?: string;
    email: string;
    plan_ids: number[];
};

type PatientFormData = {
    id?: number;
    name: string;
    cpf: string;
    phone?: string;
    email: string;
    plan_id?: number;
};

type PlanFormData = {
    id?: number;
    name: string;
    code: string;
    value: string;
};

type AppointmentFormData = {
    id?: number;
    doctor_id: number;
    patient_id: number;
    appointment_datetime: string;
};

type FormSubmissionData = DoctorFormData | PatientFormData | PlanFormData | AppointmentFormData;

export function ListPage() {
    const params = useParams();
    const navigate = useNavigate();
    const moduleParam = params.module as ModuleType | undefined;

    const selectedModule: ModuleType = moduleParam ?? 'doctors';

    const [data, setData] = useState<Doctor[] | Patient[] | Plan[] | Appointment[]>([]);
    const [reload, setReload] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitial, setModalInitial] = useState<Doctor | Patient | Plan | Appointment | null>(null);

    const config = moduleConfig[selectedModule];

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                const base = 'http://localhost:3000';
                const res = await fetch(`${base}/api/${selectedModule}`);
                if (!res.ok) throw new Error(`Failed to fetch ${selectedModule}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                console.error(err);
                toast.error('Erro ao carregar dados!');
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [selectedModule, reload]);

    const handleFormSubmit = async (payload: FormSubmissionData) => {
        const isEdit = Boolean(modalInitial?.id);
        try {
            const base = 'http://localhost:3000';
            const url = isEdit ? `${base}/api/${selectedModule}/${modalInitial!.id}` : `${base}/api/${selectedModule}`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to save');

            setModalOpen(false);
            setReload(r => r + 1);
            toast.success(isEdit ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : (isEdit ? "Erro ao atualizar!" : "Erro ao criar!");
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
                        {config.title}
                    </h1>
                    <p className={styles.listSubtitle}>
                        {config.subtitle(data.length)}
                    </p>
                    </div>
                        <button 
                            className={styles.addButton}
                            style={{ backgroundColor: config.mainColor }}
                            onClick={() => { setModalInitial(null); setModalOpen(true); }}
                            >
                            <Plus size={20} />
                            <span>{config.addLabel}</span>
                        </button>
                </div>
                </div>
                <Table
                    data={data}
                    module={selectedModule}
                    lightColor={config.lightColor}
                    onEdit={(item) => { setModalInitial(item as Doctor | Patient); setModalOpen(true); }}
                    onDelete={async (item) => {
                        try {
                            const base = 'http://localhost:3000';
                            const res = await fetch(`${base}/api/${selectedModule}/${item.id}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Failed to delete');
                            setReload(r => r + 1);
                            toast.success('Excluído com sucesso!');
                        } catch (error) {
                            console.error(error);
                            toast.error('Erro ao excluir!');
                        }
                    }}
                />

                <FormModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)}
                    title={`${modalInitial ? 'Editar' : 'Adicionar'} ${moduleConfig[selectedModule].singularTitle}`}
                >
                    {selectedModule === 'doctors' && (
                        <DoctorForm
                            key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                            initial={modalInitial as DoctorFormData | null}
                            onCancel={() => setModalOpen(false)}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                    
                    {selectedModule === 'patients' && (
                        <PatientForm
                            key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                            initial={modalInitial as PatientFormData | null}
                            onCancel={() => setModalOpen(false)}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                    
                    {selectedModule === 'plans' && (
                        <PlanForm
                            key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                            initial={modalInitial as PlanFormData | null}
                            onCancel={() => setModalOpen(false)}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                    
                    {selectedModule === 'appointments' && (
                        <AppointmentForm
                            key={modalInitial ? `edit-${modalInitial.id}` : 'new'}
                            initial={modalInitial as AppointmentFormData | null}
                            onCancel={() => setModalOpen(false)}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                </FormModal>
            </div>
        </div>
    )
}