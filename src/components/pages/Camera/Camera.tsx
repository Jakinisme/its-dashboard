import styles from "./Camera.module.css";

const Camera = () => {
    return (
        <main>
            <div className={styles.container}>
                <div className={styles.content}>
                <h1 className={styles.title}>Camera</h1>
                 <video
                   src="http://localhost:8083/stream/6fa553ca-e7fd-4061-96cf-492ef9b985c4/channel/0/hls/live/index.m3u8"
                   controls
                   autoPlay
                   muted
                   style={{ width: "80%", borderRadius: "12px" }}
                 />
                </div>
            </div>
        </main>
         
    )
}

export default Camera   