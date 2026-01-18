import styles from './Loading.module.css';

interface LoadingProps {
    text?: string;
    className?: string;
}

const Loading = ({ text = "Loading...", className = "" }: LoadingProps) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.spinner} />
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );
};

export default Loading;
