import styles from './loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            {/* Hero Skeleton */}
            <div className={styles.heroSkeleton}>
                <div className={styles.shimmer} />
            </div>

            {/* Content Grid Skeleton */}
            <div className={styles.grid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={styles.cardSkeleton}>
                        <div className={styles.shimmer} />
                    </div>
                ))}
            </div>
        </div>
    );
}
