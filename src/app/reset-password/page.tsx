'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. No token found.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Invalid Link</h1>
                        <p className={styles.subtitle}>This password reset link is invalid or has expired.</p>
                    </div>
                    <Link href="/login" className={styles.submitButton} style={{ textAlign: 'center', textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>New Password</h1>
                    <p className={styles.subtitle}>Set your new account password</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">
                            New Password
                        </label>
                        <input
                            className={styles.input}
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">
                            Confirm New Password
                        </label>
                        <input
                            className={styles.input}
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
