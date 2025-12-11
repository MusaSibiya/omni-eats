'use client';

import './globals.css';
import styles from './error.module.css';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body>
                <div className={styles.container}>
                    <div className={styles.icon}>💥</div>
                    <h1 className={styles.title}>Critical System Error</h1>
                    <p className={styles.description}>
                        {"The application encountered a critical error and could not load. We apologize for the inconvenience."}
                    </p>
                    <div className={styles.actions}>
                        <button
                            onClick={() => reset()}
                            className={styles.primaryBtn}
                        >
                            Restart Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
