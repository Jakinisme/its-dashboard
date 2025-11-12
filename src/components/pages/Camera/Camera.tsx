
import styles from "./Camera.module.css";

const Camera = () => {
    return (
        
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Live Cam</h1>
                <div className={styles.videoCropper}>
                    <iframe
                        src="http://localhost:8083/pages/player/mse/camera1/0"
                        className={styles.videoFrame}
                        allowFullScreen
                    />
                </div>
            </div>
        </main>
    );
};

export default Camera;
