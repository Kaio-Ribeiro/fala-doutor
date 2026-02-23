import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ReportData } from '../types';

export function useFetchAppointmentReports() {
    const [data, setData] = useState<{
            appointments: { plans: ReportData[], value: ReportData[], date: ReportData[], hour: ReportData[] };
        }>({
            appointments: { plans: [], value: [], date: [], hour: [] },
        });

    useEffect(() => {
        let cancelled = false;

        const formatCurrency = (amount: string): string => {
            return `R$ ${parseFloat(amount).toFixed(2)}`;
        }
        
        const fetchData = async () => {
            try {
            const base = 'http://localhost:3000';
            
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
                        value: valueData.map((item: ReportData) => ({
                            name: formatCurrency(item.name),
                            value: item.value
                            }) ),
                        date: dateData,
                        hour: hourData
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