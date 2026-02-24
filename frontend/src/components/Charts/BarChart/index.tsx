import { 
    ResponsiveContainer, 
    BarChart as RechartsBarChart, 
    XAxis, 
    YAxis, 
    Tooltip,
    CartesianGrid, 
    Bar, 
    Cell,
    LabelList} from "recharts";
import styles from './styles.module.css';

interface BarChartProps {
  color: string;
  data?: { name: string; value: number }[];
}


// A função generateColors cria uma paleta de cores HSL
// para cada barra do gráfico
const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => 
    `hsl(${(i * 360) / count}, 70%, 60%)`
  );
};

export function BarChart({ color, data }: BarChartProps) {
  // COLORS recebe o array de cores com base no tamnho do array de dados
  const COLORS = generateColors(data?.length || 0);
  
  const chartContent = (
    <div className={styles.chartContainer}>
      {/* Garante que o gráfico se ajuste ao container, deixando-o responsivo */}
      <ResponsiveContainer>
          {/* Componente principal que recebe os dados */}
          <RechartsBarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                domain={[0, 'dataMax + 0.5']}
              />
              <YAxis 
                type="category"
                dataKey="name"
                width={135}
              />
              
              {/* Representa as barras do gráficos */}
              <Bar dataKey="value" fill={color}>
                  {/* Mostra o valor sobre a barra */}
                  <LabelList dataKey="value" position="right" fill="black" />

                  {/* Personaliza a cor de cada barra */}
                  {data?.map((_, index) => (
                  <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                  />
                  ))}
              </Bar>
              {/* Mostra informações detalhadas ao passar o mouse sobre as barras */}
              <Tooltip 
                formatter={(value, _name, { payload }) => [
                  `${payload.name}: ${value}`,
                  null
                ]}
                labelFormatter={() => ""}
                itemStyle={{ color: "#000" }}
              />
          </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );

  return chartContent;
}