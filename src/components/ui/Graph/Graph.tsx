import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GraphData } from '../../../types/charts';
import styles from './Graph.module.css';

interface GraphProps {
  data: GraphData;
  title?: string;
  type?: 'line' | 'area';
  showGrid?: boolean;
  showLegend?: boolean;
}

const Graph = ({ 
  data, 
  title = 'Graph Chart', 
  type = 'line',
  showGrid = true,
  showLegend = true 
}: GraphProps) => {
  const colors = data.colors || [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#8dd1e1',
    '#d084d0',
  ];

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent
          data={data.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {showLegend && <Legend />}
          {data.dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={type === 'area' ? colors[index % colors.length] : undefined}
              fillOpacity={type === 'area' ? 0.6 : undefined}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;