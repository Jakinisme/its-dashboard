import styles from '../../History.module.css';

interface HealthStatus {
    healthy: number;
    diseased: number;
    warning: number;
}

interface StatusItemProps {
    healthStatus: HealthStatus;
}
const StatusItem = (props: StatusItemProps) => {
    const { healthStatus } = props

    const item = [
        { status: 'Healthy'},
        { status: 'Warning'},
        { status: 'Diseased'}
    ]

    return (
            item.map((item, index) => (
                <div className={styles.statItem} key={`${item.status}${index}`}>
                    <span className={styles.statLabel}>{item.status}:</span>
                    <span className={`${styles.statValue} ${styles[item.status.toLowerCase()]}`}>
                        {healthStatus[item.status.toLowerCase() as keyof HealthStatus]}
                    </span>
                </div>
            ))

    )
}

export default StatusItem;