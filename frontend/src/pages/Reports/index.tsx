import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { toast } from 'react-toastify';
import { ArrowLeft, Stethoscope, Users, Calendar } from 'lucide-react';
import { ChartWrapper } from '../../components/Charts/ChartWrapper';

type TabType = 'doctors' | 'patients' | 'appointments';

interface ReportData {
    name: string;
    value: number;
}

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



    useEffect(() => {
        let cancelled = false;

        const formatAge = (age: string): string => {
            const ageNum = parseInt(age);
            return ageNum === 0 ? 'Menos de 1 ano' : `${age} anos`;
        }

        const formatCurrency = (amount: string): string => {
            return `R$ ${parseFloat(amount).toFixed(2)}`;
        }

        const formatDate = (dateString: string): string => {
            try {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } catch {
                return dateString;
            }
        }

        const formatHour = (hour: string): string => {
            return `${hour}:00`;
        }
        
        const fetchData = async () => {
            try {
            const base = 'http://localhost:3000';
            
            if (activeTab === 'doctors') {
                const [specialtyRes, plansRes, ageRes] = await Promise.all([
                    fetch(`${base}/api/reports/doctors?type=specialty`),
                    fetch(`${base}/api/reports/doctors?type=plans`),
                    fetch(`${base}/api/reports/doctors?type=age`),
                ]);
                
                if (!specialtyRes.ok || !plansRes.ok || !ageRes.ok) {
                throw new Error('Falha ao buscar dados');
                }

                const specialtyData = await specialtyRes.json();
                const plansData = await plansRes.json();
                const ageData = await ageRes.json();
                
                if (!cancelled) {
                    setData(prev => ({
                        ...prev,
                        doctors: {
                            specialty: specialtyData,
                            plans: plansData,
                            age: ageData.map((item: ReportData) => ({
                                name: formatAge(item.name),
                                value: item.value
                             }) )
                        }
                    }));
                }
            } else if (activeTab === 'patients') {
                const [plansRes, ageRes] = await Promise.all([
                    fetch(`${base}/api/reports/patients?type=plans`),
                    fetch(`${base}/api/reports/patients?type=age`),
                ]);
                
                if (!plansRes.ok || !ageRes.ok) {
                throw new Error('Falha ao buscar dados');
                }

                const plansData = await plansRes.json();
                const ageData = await ageRes.json();
                
                if (!cancelled) {
                    setData(prev => ({
                        ...prev,
                        patients: {
                            plans: plansData,
                            age: ageData.map((item: ReportData) => ({
                                ...item,
                                name: formatAge(item.name)
                             }) )
                        }
                    }));
                }
            } else if (activeTab === 'appointments') {
                const [plansRes, valueRes, dateRes, hourRes] = await Promise.all([
                    fetch(`${base}/api/reports/appointments?type=plans`),
                    fetch(`${base}/api/reports/appointments?type=value`),
                    fetch(`${base}/api/reports/appointments?type=date`),
                    fetch(`${base}/api/reports/appointments?type=hour`),
                ]);
                
                if (!plansRes.ok || !valueRes.ok || !dateRes.ok || !hourRes.ok) {
                    throw new Error('Falha ao buscar dados');
                }
                const plansData = await plansRes.json();
                const valueData = await valueRes.json();
                const dateData = await dateRes.json();
                const hourData = await hourRes.json();

                if (!cancelled) {
                    setData(prev => ({
                        ...prev,
                        appointments: {
                            plans: plansData,
                            hour: hourData.map((item: ReportData) => ({
                                ...item,
                                name: formatHour(item.name)
                             }) ),
                            date: dateData.map((item: ReportData) => ({
                                ...item,
                                name: formatDate(item.name)
                            })),
                            value: valueData.map((item: ReportData) => ({
                                ...item,
                                name: formatCurrency(item.name)
                             }) )
                        }
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
    }, [activeTab]);

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
            </div>
        </div>
    )
}