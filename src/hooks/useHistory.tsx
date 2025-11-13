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

export const useHistory = (): UseHistoryResult => {
  const [history, setHistory] = useState<SoilHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const historyRef = ref(database, SOIL_RTDB_PATHS.history);

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const rawHistory = snapshot.val() as Record<
          string,
          Record<string, unknown>
        > | null;

        if (!rawHistory) {
          setHistory([]);
          setError(null);
          setLoading(false);
          return;
        }

        const entries = Object.entries(rawHistory).reduce<SoilHistoryEntry[]>(
          (accumulator, [key, value]) => {
            const sanitized = sanitizeSoilSnapshot(value);
            if (sanitized) {
              accumulator.push({
                key,
                label: new Date(sanitized.timestamp).toLocaleString(),
                ...sanitized,
              });
            }
            return accumulator;
          },
          [],
        );

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
  }, []);

  const graph = useMemo<GraphData>(() => {
    if (!history.length) {
      return DEFAULT_GRAPH;
    }

    const data = history.map((entry) => ({
      timestamp: entry.timestamp,
      label: entry.label,
      moisture: entry.moisture,
      humidity: entry.humidity,
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

