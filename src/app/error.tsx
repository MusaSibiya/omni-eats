'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.icon}>⚠️</div>
            <h1 className={styles.title}>Something went wrong!</h1>
            <p className={styles.description}>
                {"We encountered an unexpected issue. Please try refreshing the page or contact support if the problem persists."}
            </p>
            <div className={styles.actions}>
                <button
                    onClick={() => reset()}
                    className={styles.primaryBtn}
                >
                    Try Again
                </button>
                <Link href="/" className={styles.secondaryBtn}>
                    Go Home
                </Link>
            </div>
        </div>
    );
}
