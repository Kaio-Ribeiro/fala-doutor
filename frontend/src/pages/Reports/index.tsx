import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { ArrowLeft, Stethoscope, Users, Calendar } from 'lucide-react';

type TabType = 'doctors' | 'patients' | 'appointments';

export function ReportsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('doctors');

    const tabs = [
        { id: 'doctors' as TabType, label: 'Doutores', icon: Stethoscope, color: '#2563EB' },
        { id: 'patients' as TabType, label: 'Pacientes', icon: Users, color: '#059669' },
        { id: 'appointments' as TabType, label: 'Consultas', icon: Calendar, color: '#D97706' }
    ];

    const ChartMockup = ({ title, color, type }: { title: string; color: string; type: 'bar' | 'line' | 'pie' }) => (
        <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>{title}</h3>
            <div className={styles.chartContainer}>
                {type === 'bar' && (
                    <div className={styles.barChart}>
                        {[40, 70, 30, 85, 60].map((height, index) => (
                            <div 
                                key={index} 
                                className={styles.bar} 
                                style={{ height: `${height}%`, backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
                {type === 'line' && (
                    <div className={styles.lineChart}>
                        <svg viewBox="0 0 300 150" className={styles.lineSvg}>
                            <polyline 
                                points="20,120 80,80 140,100 200,60 260,90" 
                                fill="none" 
                                stroke={color} 
                                strokeWidth="3"
                            />
                            {[20, 80, 140, 200, 260].map((x, index) => (
                                <circle key={index} cx={x} cy={[120, 80, 100, 60, 90][index]} r="4" fill={color} />
                            ))}
                        </svg>
                    </div>
                )}
                {type === 'pie' && (
                    <div className={styles.pieChart}>
                        <svg viewBox="0 0 100 100" className={styles.pieSvg}>
                            <circle cx="50" cy="50" r="40" fill="#f3f4f6" />
                            <circle 
                                cx="50" 
                                cy="50" 
                                r="20" 
                                fill="none" 
                                stroke={color} 
                                strokeWidth="40" 
                                strokeDasharray="60 40" 
                                strokeDashoffset="25"
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'doctors':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartMockup title="Doutores por Especialidade" color="#2563EB" type="bar" />
                        <ChartMockup title="Consultas por Mês" color="#2563EB" type="line" />
                        <ChartMockup title="Distribuição por Plano" color="#2563EB" type="pie" />
                    </div>
                );
            case 'patients':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartMockup title="Pacientes por Idade" color="#059669" type="bar" />
                        <ChartMockup title="Cadastros por Mês" color="#059669" type="line" />
                        <ChartMockup title="Pacientes por Plano" color="#059669" type="pie" />
                    </div>
                );
            case 'appointments':
                return (
                    <div className={styles.chartsGrid}>
                        <ChartMockup title="Consultas por Dia" color="#D97706" type="line" />
                        <ChartMockup title="Status das Consultas" color="#D97706" type="bar" />
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