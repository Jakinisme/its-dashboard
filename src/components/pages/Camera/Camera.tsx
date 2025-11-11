import styles from "./Camera.module.css";

const Camera = () => {
    return (
        <main>
            <div className={styles.container}>
                <div className={styles.content}>
                <h1 className={styles.title}>Camera</h1>
                 <video
                   src="http://localhost:8083/stream/afe4036f-e7fa-431d-aaf6-ed707f08c722/channel/0/hlsll/live/index.m3u8"
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