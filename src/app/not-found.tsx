import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>404</h1>
            <h2 className={styles.subtitle}>Page Not Found</h2>
            <p className={styles.description}>
                {"Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."}
            </p>
            <Link href="/" className={styles.button}>
                Back to Home
            </Link>
        </div>
    );
}
