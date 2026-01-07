import VideoFeed from "../../ui/VideoFeed";
import styles from "./Camera.module.css";

import { useLive } from "../../../hooks/useLive";
import { useStreamState } from "../../../hooks/useStreamState";


const Camera = () => {
  const { isLive } = useLive();

  const { timeAgo } = useStreamState({
    streamId: "vertical_farming_cam_01",
    isLive,
  });


  const metaContent = [
    { label: "Resolution", value: "1280 x 720" },
    { label: "Bitrate", value: "4.2 Mbps" },
    { label: "FPS", value: "15" },
  ]
  const cameraStatus = [
    { label: "Camera 01", location: "Vertical Garden", status: `${isLive ? "Live" : "Offline"}` },
  ]
  const recentActivity = [
    { time: "14:05", activity: "Tanaman dalam keadaan sehat" },
    { time: "13:58", activity: "Tanaman memiliki indikasi penyakit" },
    { time: "13:25", activity: "Tanaman dalam keadaan sehat" },
  ]





  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <h1 className={styles.title}>Live Monitoring</h1>
        <p className={styles.timestamp}>Updated {timeAgo}</p>
      </section>

      <section className={styles.layout}>
        <div className={styles.primaryFeed}>
          <div className={styles.streamHeader}>
            <h2>Vertical Garden</h2>
            <span className={styles.badge}>{isLive ? "Live" : "Offline"}</span>
          </div>

          <div className={styles.streamFrame}>
            <VideoFeed />
          </div>

          <div className={styles.streamMeta}>
            {metaContent.map((meta) => (
              <div key={`${meta.label}`} className={styles.metaItem}>
                <span className={styles.metaLabel}>{meta.label}: </span>
                <span className={styles.metaValue}>{meta.value}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3>Camera Status</h3>
            <ul>
              {cameraStatus.map((camera) => (
                <li key={camera.label}>
                  <span className={styles.cameraLabel}>{camera.label}: </span>
                  <span className={styles.cameraLocation}>{camera.location} - </span>
                  <span className={styles.cameraStatus}>{camera.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.card}>
            <h3>Recent Activity</h3>
            <ul>
              {recentActivity.map((activity, index) => (
                <li key={index}>
                  <span className={styles.activityTime}>{activity.time} - </span>
                  <span className={styles.activityDescription}>{activity.activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Camera;
