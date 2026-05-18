'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { applyToBeDriver } from '@/lib/driverActions';
import { Footer } from '@/components/layout/Footer';

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
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'var(--surface-primary)', padding: '4rem', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏎️</div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to the Fleet!</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {session 
                                ? "Your account has been upgraded! Taking you to the Driver Portal..."
                                : "Your driver account was created successfully! Taking you to login..."
                            }
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', paddingTop: '100px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Drive with Omni Eats</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Turn your free time into earnings by delivering the city's best meals.</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <div style={{ background: 'var(--surface-primary)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {session ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
                                    👤
                                </div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Logged in as {session.user?.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You're just one click away from upgrading your account to a Driver profile!</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required 
                                        placeholder="John Doe"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        placeholder="john@example.com"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        required 
                                        placeholder="+27 XX XXX XXXX"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        required 
                                        placeholder="Min 6 characters"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Confirm Password</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        required 
                                        placeholder="Confirm your password"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
                                    />
                                </div>
                            </>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                marginTop: '1rem',
                                padding: '16px', 
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #E85D2A 100%)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)'
                            }}
                        >
                            {loading ? 'Processing...' : session ? 'Upgrade to Driver' : 'Apply to Drive'}
                        </button>
                    </form>
                </div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </div>
    );
}
