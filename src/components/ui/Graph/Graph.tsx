/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts/types/component/Tooltip";
import type {
  NameType,
  Payload as TooltipPayload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { GraphData } from "../../../types/charts";
import styles from "./Graph.module.css";

interface GraphProps {
  data: GraphData;
  title?: string;
  type?: 'line' | 'area';
  showGrid?: boolean;
  showLegend?: boolean;
}

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload<ValueType, NameType>[];
};

const formatTime = (value: number | string): string => {
  const timestamp = typeof value === 'string' ? Number(value) : value;
  if (isNaN(timestamp)) {
    return String(value);
  }
  
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  // Format the label if it's a timestamp (number) or already formatted string
  const formattedLabel = typeof label === 'number' 
    ? formatTime(label) 
    : (typeof label === 'string' && !isNaN(Number(label)))
      ? formatTime(Number(label))
      : label;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{formattedLabel}</p>
      <div className={styles.tooltipItems}>
        {payload.map(({ dataKey, value, color, name }, index) => (
          <div
            key={dataKey !== undefined ? String(dataKey) : index}
            className={styles.tooltipItem}
          >
            <span
              className={styles.tooltipDot}
              style={{ backgroundColor: color ?? "#ffffff" }}
            />
            <span className={styles.tooltipName}>
              {name ?? (dataKey !== undefined ? String(dataKey) : "-")}
            </span>
            <span className={styles.tooltipValue}>
              {value !== undefined ? String(value) : "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Graph = ({
  data,
  title = "Graph Chart",
  type = "line",
  showGrid = true,
  showLegend = true,
}: GraphProps) => {
  const colors = data.colors || [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#d084d0",
  ];

  const ChartComponent = type === "area" ? AreaChart : LineChart;
  const DataComponent = type === "area" ? Area : Line;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent
          data={data.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2a3140" />}
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["20", "20"]}
            tickFormatter={(value: any) => formatTime(Number(value))}
          />
          <YAxis />
          <Tooltip
            content={<CustomTooltip />}
            labelFormatter={(value: any, tooltipPayload) => {
              if (
                tooltipPayload?.length &&
                typeof tooltipPayload[0].payload.label === "string"
              ) {
                return tooltipPayload[0].payload.label;
              }
              return formatTime(Number(value));
            }}
            cursor={{ stroke: "#ffffff", strokeDasharray: "4 4" }}
          />
          {showLegend && <Legend />}
          {data.dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={
                type === "area" ? colors[index % colors.length] : undefined
              }
              fillOpacity={type === "area" ? 0.4 : undefined}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;