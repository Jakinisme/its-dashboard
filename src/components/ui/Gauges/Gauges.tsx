import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import type { GaugeData } from '../../../types/charts';
import styles from './Gauges.module.css';

interface GaugesProps {
  data: GaugeData[];
  title?: string;
}

const Gauges = ({ data, title = 'Gauges' }: GaugesProps) => {
    
  const chartData = data.map((item, index) => ({
    key: index,
    name: item.name,
    value: item.value,
    maxValue: item.maxValue || 100,
    fill: item.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.gaugesGrid}>
        {chartData.map((gauge, index) => {
          const percentage = (gauge.value / gauge.maxValue) * 100;
          const chartDataForGauge = [
            { name: 'value', value: gauge.value, fill: gauge.fill },
            { name: 'remaining', value: gauge.maxValue - gauge.value, fill: '#ffffffff' },
          ];

          return (
            <div key={index} className={styles.gaugeItem}>
              <h3 className={styles.gaugeName}>{gauge.name}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  barSize={20}
                  data={chartDataForGauge}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={gauge.fill}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className={styles.gaugeValue}>
                <span className={styles.value}>{gauge.value}</span>
                <span className={styles.maxValue}>/ {gauge.maxValue}</span>
                <span className={styles.percentage}>({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gauges;