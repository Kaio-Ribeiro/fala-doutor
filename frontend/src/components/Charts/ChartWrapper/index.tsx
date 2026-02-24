import { useState } from 'react';
import { BarChart as BarIcon, PieChart as PieIcon } from 'lucide-react';
import { PieChart } from '../PieChart';
import { BarChart } from '../BarChart';
import styles from './styles.module.css';

interface ChartWrapperProps {
  data: { name: string; value: number }[];
  title: string;
  color: string;
  defaultType?: 'pie' | 'bar';
}

export function ChartWrapper({ data, title, color, defaultType = 'pie' }: ChartWrapperProps) {
  // Estado para controlar o tipo de gráfico
  const [chartType, setChartType] = useState<'pie' | 'bar'>(defaultType);

  // Função para alternar o tipo de gráfico ao clicar no botão
  const toggleChartType = () => {
    setChartType(prev => prev === 'pie' ? 'bar' : 'pie');
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <button 
          className={styles.toggleButton} 
          onClick={toggleChartType}
          title={`Alternar para ${chartType === 'pie' ? 'Gráfico de Barras' : 'Gráfico de Pizza'}`}
        >
          {chartType === 'pie' ? <BarIcon size={16} /> : <PieIcon size={16} />}
        </button>
      </div>
      
      {/* De acordo com o chartType, renderiza o gráfico correspondente */}
      <div className={styles.chartContent}>
        {chartType === 'pie' ? (
          <PieChart data={data} color={color} />
        ) : (
          <BarChart data={data} color={color} />
        )}
      </div>
    </div>
  );
}