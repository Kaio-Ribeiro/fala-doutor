import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ReportData } from '../types';

export function useFetchPatientsReports() {
    const [data, setData] = useState<{
            patients: { plans: ReportData[], age: ReportData[] };
        }>({
            patients: { plans: [], age: [] },
        });

    useEffect(() => {
        let cancelled = false;

        const formatAge = (age: string): string => {
            const ageNum = parseInt(age);
            return ageNum === 0 ? 'Menos de 1 ano' : `${age} anos`;
        }
        
        const fetchData = async () => {
            try {
            const base = 'http://localhost:3000';
            
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
                            name: formatAge(item.name),
                            value: item.value
                            }) )
                    }
                }));
            } 
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados dos relatórios!');
            }
        };
        
        fetchData();
        return () => { cancelled = true; };
    }, []);

    return data;
}