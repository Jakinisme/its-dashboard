
import styles from "./Camera.module.css";

const Camera = () => {
    const metaContent = [
        { label: "Resolution", value: "1920 x 1080" },
        { label: "Bitrate", value: "4.2 Mbps" },
        { label: "FPS", value: "30" },
    ]
    const cameraStatus = [
        { label: "Camera 01", location: "Vertical Garden", status: "Online" },
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
                <p className={styles.timestamp}>Updated just now</p>
            </section>

            <section className={styles.layout}>
                <div className={styles.primaryFeed}>
                    <div className={styles.streamHeader}>
                        <h2>Vertical Garden</h2>
                        <span className={styles.badge}>Live</span>
                    </div>

                    <div className={styles.streamFrame}>
                        <iframe
                            src="http://localhost:8083/pages/player/mse/camera1/0"
                            title="Main entrance live stream"
                            allowFullScreen
                        />
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
