'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const urlOrderId = searchParams.get('orderId');

        if (urlOrderId) setOrderId(urlOrderId);

        if (paymentIntentId) {
            // Confirm the order on the backend
            fetch('/api/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentId }),
            })
                .then(res => {
                    if (res.ok) {
                        setStatus('success');
                        clearCart();
                    } else {
                        setStatus('error');
                    }
                })
                .catch(() => setStatus('error'));
        } else {
            // If no payment intent, maybe just visiting? redirect?
            // For now, let's just stay or redrect home
        }
    }, [searchParams, clearCart]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.successCard}>
                <div className={styles.iconWrapper}>
                    {status === 'loading' && <div className={styles.spinner}></div>}
                    {status === 'success' && (
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.successIcon}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    )}
                    {status === 'error' && <span style={{ fontSize: '4rem' }}>⚠️</span>}
                </div>

                {status === 'loading' && <h1>Finalizing Order...</h1>}

                {status === 'success' && (
                    <>
                        <h1>Order Confirmed!</h1>
                        <p>Thank you for your order. We're firing up the ovens!</p>
                        {orderId && <p className={styles.orderId}>Order #{orderId.slice(-6).toUpperCase()}</p>}
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1>Something went wrong</h1>
                        <p>We received your payment but couldn't finalize the order details. Please contact support.</p>
                        {orderId && <p className={styles.orderId}>Reference: {orderId}</p>}
                    </>
                )}

                <div className={styles.actions}>
                    <Link href="/">
                        <button className={styles.btnPrimary}>Back to Home</button>
                    </Link>
                    <Link href="/profile">
                        <button className={styles.btnSecondary}>View Order History</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
