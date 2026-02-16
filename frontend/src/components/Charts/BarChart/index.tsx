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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export function BarChart({ color, data, hideWrapper = false }: BarChartProps) {
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