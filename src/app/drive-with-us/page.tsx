'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { applyToBeDriver } from '@/lib/driverActions';
import { Footer } from '@/components/layout/Footer';
import styles from './page.module.css';

export default function DriveWithUsPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        
        // Validation for new users
        if (!session) {
            const password = formData.get('password') as string;
            const confirmPassword = formData.get('confirmPassword') as string;
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }
        }

        try {
            const res = await applyToBeDriver(formData);
            if (res.success) {
                if (session) {
                    await update({ role: 'DRIVER' }); // Refresh the session token!
                }
                
                setSuccess(true);
                // Redirect logged-in users directly to their new dashboard
                setTimeout(() => {
                    if (session) {
                        window.location.href = '/driver-dashboard';
                    } else {
                        router.push('/login?message=Driver+account+created.+Please+log+in.');
                    }
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.main}>
                <div className={styles.successWrapper}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>🏎️</div>
                        <h1 className={styles.successTitle}>Welcome to the Fleet!</h1>
                        <p className={styles.successText}>
                            {session 
                                ? "Your account has been upgraded! Taking you to the Driver Portal..."
                                : "Your driver account was created successfully! Taking you to login..."
                            }
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Drive with Sotobe Eats</h1>
                    <p className={styles.subtitle}>Turn your free time into earnings by delivering the city's best meals.</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        
                        {session ? (
                            <div className={styles.sessionNotice}>
                                <h3>Hey, {session.user?.name}!</h3>
                                <p>You're already logged in. Ready to upgrade your account and start earning as a driver?</p>
                                <input type="hidden" name="email" value={session.user?.email || ''} />
                                <input type="hidden" name="name" value={session.user?.name || ''} />
                            </div>
                        ) : (
                            <>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <input className={styles.input} type="text" name="name" placeholder="John Doe" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input className={styles.input} type="email" name="email" placeholder="john@example.com" required />
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Password</label>
                                        <input className={styles.input} type="password" name="password" placeholder="••••••••" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Confirm Password</label>
                                        <input className={styles.input} type="password" name="confirmPassword" placeholder="••••••••" required />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Vehicle Type</label>
                                <select className={styles.input} name="vehicleType" required>
                                    <option value="BICYCLE">Bicycle</option>
                                    <option value="MOTORBIKE">Motorbike / Scooter</option>
                                    <option value="CAR">Car</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone Number</label>
                                <input className={styles.input} type="tel" name="phone" placeholder="+27 12 345 6789" required />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (session ? 'Upgrade to Driver' : 'Register as Driver')}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
