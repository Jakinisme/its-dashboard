import styles from "./Profile.module.css";

const Profile = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <span className={styles.avatar}></span>
                <span className={styles.name}>John Doe</span>
                <span className={styles.email}>johndoe@example.com</span>
            </div>
        </div>
    )
};

export default Profile;