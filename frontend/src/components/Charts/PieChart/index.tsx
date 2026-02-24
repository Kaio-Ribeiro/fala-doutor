import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Tooltip, Legend, Cell, LabelList } from "recharts";
import styles from './styles.module.css';

interface PieChartProps {
  data: { name: string; value: number }[];
  color: string;
}


// A função generateColors cria uma paleta de cores HSL
// para cada fatia do gráfico
const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => 
    `hsl(${(i * 360) / count}, 70%, 60%)`
  );
};

export function PieChart({ data }: PieChartProps) {
  const COLORS = generateColors(data?.length || 0);

  const chartContent = (
    <div className={styles.chartContainer}>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={3}
            label={(entry) => {
              // Calcula o total para obter a porcentagem de cada fatia
              // Reduce percorre o array de dados somando os valores para obter o total
              const total = data.reduce((sum, item) => sum + item.value, 0);
              const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
              return `${percent}%`;
            }}
            labelLine={false}
          >
              <LabelList 
                  dataKey="value" 
                  position="inside" 
                  fill="white"
              />
              {data.map((_, index) => (
                  <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                  />
              ))}
          </Pie>
          <Tooltip />
          <Legend 
            verticalAlign="middle" 
            align="right" 
            layout="vertical"
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );

  return chartContent;
}