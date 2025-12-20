import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";

import type { GraphData } from "../types/charts";
import { database } from "../services/Firebase";
import { SOIL_METRIC_CONFIG, SOIL_RTDB_PATHS } from "../constants/soil";
import {
  METRIC_KEYS,
  sanitizeSoilSnapshot,
  type SoilMetricSnapshot,
} from "../utils/soil";

type DataType = 'daily' | 'weekly' | 'monthly';

const getPathForDataType = (dataType: DataType): string => {
  switch (dataType) {
    case 'daily':
      return SOIL_RTDB_PATHS.history;
    case 'weekly':
      return SOIL_RTDB_PATHS.weekly;
    case 'monthly':
      return SOIL_RTDB_PATHS.monthly;
  }
};

interface SoilHistoryEntry extends SoilMetricSnapshot {
  key: string;
  label: string;
}

interface UseHistoryResult {
  history: SoilHistoryEntry[];
  graph: GraphData;
  loading: boolean;
  error: string | null;
}

const DEFAULT_GRAPH: GraphData = {
  data: [],
  dataKeys: METRIC_KEYS,
  colors: METRIC_KEYS.map((key) => SOIL_METRIC_CONFIG[key].color),
};

export const useHistory = (selectedDate?: string, dataType: DataType = 'daily'): UseHistoryResult => {
  const [history, setHistory] = useState<SoilHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const basePath = getPathForDataType(dataType);
    const path = selectedDate 
      ? `${basePath}/${selectedDate}`
      : basePath;
    
    const historyRef = ref(database, path);

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const rawData = snapshot.val();

        if (!rawData) {
          setHistory([]);
          setError(null);
          setLoading(false);
          return;
        }

        let entries: SoilHistoryEntry[] = [];

        if (selectedDate) {
          // Single date selected - data is directly the metrics object
          // Handle both "humidtiy" typo and "humidity"
          const sanitized = sanitizeSoilSnapshot(rawData as Record<string, unknown>);
          if (sanitized) {
            // Convert date string (DD-MM-YYYY) to timestamp
            const [day, month, year] = selectedDate.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            
            entries.push({
              key: selectedDate,
              label: date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              ...sanitized,
              timestamp: sanitized.timestamp || date.getTime(),
            });
          }
        } else {
          // All dates - data is organized by date keys
          const rawHistory = rawData as Record<string, Record<string, unknown>> | null;
          
          if (rawHistory) {
            entries = Object.entries(rawHistory).reduce<SoilHistoryEntry[]>(
              (accumulator, [dateKey, value]) => {
                // Skip if it's not a date format (like nested objects)
                if (!/^\d{2}-\d{2}-\d{4}$/.test(dateKey)) {
                  return accumulator;
                }

                const sanitized = sanitizeSoilSnapshot(value);
                if (sanitized) {
                  // Convert date string (DD-MM-YYYY) to timestamp
                  const [day, month, year] = dateKey.split("-").map(Number);
                  const date = new Date(year, month - 1, day);
                  
                  accumulator.push({
                    key: dateKey,
                    label: date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }),
                    ...sanitized,
                    timestamp: sanitized.timestamp || date.getTime(),
                  });
                }
                return accumulator;
              },
              [],
            );
          }
        }

        entries.sort((a, b) => a.timestamp - b.timestamp);

        setHistory(entries);
        setError(null);
        setLoading(false);
      },
      (firebaseError) => {
        setError(firebaseError.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [selectedDate, dataType]);

  const graph = useMemo<GraphData>(() => {
    if (!history.length) {
      return DEFAULT_GRAPH;
    }

    const data = history.map((entry) => ({
      timestamp: entry.timestamp,
      label: entry.label,
      moisture: entry.moisture,
      temperature: entry.temperature,
      light: entry.light,
    }));

    return {
      data,
      dataKeys: METRIC_KEYS,
      colors: METRIC_KEYS.map((key) => SOIL_METRIC_CONFIG[key].color),
    };
  }, [history]);

  return {
    history,
    graph,
    loading,
    error,
  };
};

