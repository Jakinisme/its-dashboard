import styles from "./Profile.module.css";

const Profile = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <span className={styles.avatar}></span>
                <span className={styles.name}>Jaki Ganteng</span>
                <span className={styles.email}>jaki@example.com</span>
            </div>
        </div>
    )
};

export default Profile;