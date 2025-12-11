import VideoFeed from "../../ui/VideoFeed";
import styles from "./Camera.module.css";

import { useEffect, useState } from "react";
import { useLive } from "../../../hooks/useLive";


const Camera = () => {
    const { isLive } = useLive();

    const [counter, setCounter] = useState(1);
    const [time, setTime] = useState("");
    const storageKey = "liveOfflineStart";
    
    useEffect(() => {
      let interval: number | undefined;

      const getElapsedSeconds = () => {
        if (typeof window === "undefined") return null;
        const stored = window.localStorage.getItem(storageKey);
        if (!stored) return null;

        const start = Number(stored);
        if (!Number.isFinite(start)) return null;

        const diff = Math.floor((Date.now() - start) / 1000);
        return diff > 0 ? diff : 1;
      };
    
      if (!isLive) {
        const existingStart = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
        if (!existingStart && typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, `${Date.now()}`);
        }

        const elapsed = getElapsedSeconds();
        if (elapsed !== null) {
          setCounter(elapsed);
        }

        interval = window.setInterval(() => {
          setCounter((prev) => prev + 1);
        }, 1000);
      } else {
        setCounter(0);
        setTime("Just now");
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(storageKey);
        }
      }
    
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isLive]);

    useEffect(() => {
      if (counter < 60 && counter >= 1) {
        setTime(`Updated ${counter} second${counter === 1 ? "s" : ""} ago`);
      } else if (counter < 3600 && counter >= 60) {
        const min = Math.floor(counter / 60);
        setTime(`Updated ${min} minute${min !== 1 ? "s" : ""} ago`);
      } else if (counter < 86400 && counter >= 3600) {
        const hr = Math.floor(counter / 3600);
        setTime(`Updated ${hr} hour${hr !== 1 ? "s" : ""} ago`);
      } else if (counter >= 86400) {
        const day = Math.floor(counter / 86400);
        setTime(`Updated ${day} day${day !== 1 ? "s" : ""} ago`);
      }
    }, [counter]);


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
                <p className={styles.timestamp}>{time}</p>
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
