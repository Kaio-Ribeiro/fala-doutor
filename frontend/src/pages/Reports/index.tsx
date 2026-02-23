import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { toast } from 'react-toastify';
import { Container } from "../../components/Container";
import { ArrowLeft, Stethoscope, Users, Calendar } from 'lucide-react';
import { ChartWrapper } from '../../components/Charts/ChartWrapper';
import type { ReportData, TabType } from '../../types';
import { useFetchDoctorReports } from '../../hooks/useFetchDoctorReports';
import { useFetchPatientsReports } from '../../hooks/useFetchPatientsReports';
import { useFetchAppointmentReports } from '../../hooks/useFetchAppointmentReports';

export function ReportsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('doctors');
    const [data, setData] = useState<{
        doctors: { specialty: ReportData[], plans: ReportData[], age: ReportData[] };
        patients: { plans: ReportData[], age: ReportData[] };
        appointments: { plans: ReportData[], value: ReportData[], date: ReportData[], hour: ReportData[] };
    }>({
        doctors: { specialty: [], plans: [], age: [] },
        patients: { plans: [], age: [] },
        appointments: { plans: [], value: [], date: [], hour: [] }
    });

    const { doctors } = useFetchDoctorReports();
    const { patients } = useFetchPatientsReports();
    const { appointments } = useFetchAppointmentReports();

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                if (activeTab === 'doctors') {

                    if (!cancelled) {
                        setData(prev => ({
                        ...prev,
                        doctors: doctors
                    }));
                    }
                } else if (activeTab === 'patients') {
                    if (!cancelled) {
                        setData(prev => ({
                            ...prev,
                            patients: patients
                        }));
                    }
                } else if (activeTab === 'appointments') {
                    if (!cancelled) {
                        setData(prev => ({
                            ...prev,
                            appointments: appointments
                        }));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                toast.error('Erro ao carregar dados dos relatórios!');
                }
            };
        
        fetchData();
        return () => { cancelled = true; };
    }, [activeTab, doctors, patients, appointments]);

    const tabs = [
        { id: 'doctors' as TabType, label: 'Doutores', icon: Stethoscope, color: '#2563EB' },
        { id: 'patients' as TabType, label: 'Pacientes', icon: Users, color: '#059669' },
        { id: 'appointments' as TabType, label: 'Consultas', icon: Calendar, color: '#D97706' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'doctors':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartWrapper 
                            data={data.doctors.specialty} 
                            title="Doutores por Especialidade" 
                            color="#2563EB"
                            defaultType="bar"
                        />
                        <ChartWrapper 
                            data={data.doctors.plans} 
                            title="Doutores por Plano" 
                            color="#2563EB"
                            defaultType="pie"
                        />
                        <ChartWrapper 
                            data={data.doctors.age} 
                            title="Doutores por Idade" 
                            color="#2563EB"
                            defaultType="pie"
                        />
                    </div>
                );
            case 'patients':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartWrapper 
                            data={data.patients.plans} 
                            title="Pacientes por Plano" 
                            color="#059669"
                            defaultType="pie"
                        />
                        <ChartWrapper 
                            data={data.patients.age} 
                            title="Pacientes por Idade" 
                            color="#059669"
                            defaultType="pie"
                        />
                    </div>
                );
            case 'appointments':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartWrapper 
                            data={data.appointments.plans} 
                            title="Consultas por Plano" 
                            color="#D97706"
                            defaultType="pie"
                        />

                        <ChartWrapper 
                            data={data.appointments.value} 
                            title="Consultas por Valor" 
                            color="#D97706"
                            defaultType="pie"
                        />

                        <ChartWrapper 
                            data={data.appointments.date} 
                            title="Consultas por Data" 
                            color="#D97706"
                            defaultType="bar"
                        />

                        <ChartWrapper 
                            data={data.appointments.hour} 
                            title="Consultas por Hora" 
                            color="#D97706"
                            defaultType="bar"
                        />
                    </div>
                );
            default:
                return null;
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
                            Relatórios
                        </h1>
                        <p className={styles.listSubtitle}>
                            Analise os relatórios e seus dados
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <div className={styles.tabsNav}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    borderBottomColor: activeTab === tab.id ? tab.color : 'transparent',
                                    color: activeTab === tab.id ? tab.color : '#6B7280'
                                }}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.tabContent}>
                    {renderContent()}
                </div>
            </div>
        </Container>
    )
}