import Gauges from "../../ui/Gauges";
import Graph from "../../ui/Graph";
import { useCurrent } from "../../../hooks/useCurrent";

import "../../../styles/global.css";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const {
    gauges,
    graph,
    loading,
    error,
  } = useCurrent();

  const isReady = !loading && !error;

  return (
    <main>
      <div className={styles.Dashboard}>
        <div className={styles.Gauges}>
          {loading && <p>Loading current metrics</p>}
          {isReady && <Gauges data={gauges} title="Current Metrics" />}
        </div>
        <div className={styles.Graph}>
          {loading && <p>Loading graph</p>}
          {isReady && graph.data.length > 0 && (
            <Graph data={graph} title="Realtime Graph" type="area" />
          )}
          {isReady && graph.data.length === 0 && <p>No data available.</p>}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;