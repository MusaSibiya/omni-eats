'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">
                            Email Address
                        </label>
                        <input
                            className={styles.input}
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="m@example.com"
                            required
                        />
                    </div>

                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Remembered your password?{' '}
                    <Link href="/login" className={styles.footerLink}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
