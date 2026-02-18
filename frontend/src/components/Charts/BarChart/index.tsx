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
  hideWrapper?: boolean;
}

const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => 
    `hsl(${(i * 360) / count}, 70%, 60%)`
  );
};

export function BarChart({ color, data, hideWrapper = false }: BarChartProps) {
  const COLORS = generateColors(data?.length || 0);
  const chartContent = (
    <div className={styles.chartContainer}>
      <ResponsiveContainer>
          <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              
              <Bar dataKey="value" fill={color}>
                  <LabelList dataKey="value" position="inside" fill="white" />
                  {data?.map((_, index) => (
                  <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                  />
                  ))}
              </Bar>
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

  if (hideWrapper) {
    return chartContent;
  }

  return (
    <div className={styles.chartCard}>
      {chartContent}
    </div>
  );
}