export interface GaugeData {
  name: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export interface GraphDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface GraphData {
  data: GraphDataPoint[];
  dataKeys: string[];
  colors?: string[];
}




