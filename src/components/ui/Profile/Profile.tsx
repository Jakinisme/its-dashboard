import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

const Profile = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/profile");
    };

    return (
        <div className={styles.container}>
            <button type="button" className={styles.content} onClick={handleNavigate}>
                <span className={styles.avatar}></span>
                <span className={styles.name}>Jaki Ganteng</span>
                <span className={styles.email}>jaki@example.com</span>
            </button>
        </div>
    );
};

export default Profile;