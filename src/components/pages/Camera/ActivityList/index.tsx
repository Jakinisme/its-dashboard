import styles from "../../Camera.module.css";

interface Activity {
    timestamp: string;
    activity: string;
}

const ActivityList = () => {
    const activities: Activity[] = []

    return (
        <div>
            <h2>Recent Activity</h2>
            <ul>
                {activities.map((activity, index) => (
                    <li key={`${index}${activity}`}>
                        <span className={styles.activityTime}>{activity.timestamp} - </span>
                        <span className={styles.activityDescription}>{activity.activity}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ActivityList;