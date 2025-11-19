import styles from "./Profile.module.css";
import { useAuth } from "../../../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? "Anonymous";

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.avatar}></span>
        <span className={styles.name}>{displayName}</span>
        {user?.email && <span className={styles.email}>{user.email}</span>}
      </div>
    </div>
  );
};

export default Profile;