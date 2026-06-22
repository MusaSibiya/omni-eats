'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

export default function CheckoutSuccessClient() {
    const { clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const paymentIntentId = searchParams.get('payment_intent');
        const urlOrderId = searchParams.get('orderId');

        console.log('Success page loaded with params:', { paymentIntentId, urlOrderId });

        if (urlOrderId) setOrderId(urlOrderId);

        if (paymentIntentId && urlOrderId) {
            // Handle both mock and real payments
            console.log('Calling /api/orders/confirm with:', { paymentIntentId, orderId: urlOrderId });

            fetch('/api/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentId, orderId: urlOrderId }),
            })
                .then(async res => {
                    console.log('Raw response status:', res.status);
                    console.log('Raw response ok:', res.ok);
                    console.log('Raw response headers:', Object.fromEntries(res.headers.entries()));

                    const text = await res.text();
                    console.log('Raw response text:', text);

                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                        data = { error: 'Invalid JSON response', rawText: text };
                    }

                    console.log('Confirm API Response:', { status: res.status, data });

                    if (res.ok) {
                        setStatus('success');
                        clearCart();
                        // Update orderId if returned from API
                        if (data.order?.id) {
                            setOrderId(data.order.id);
                        }
                    } else {
                        console.error('Confirm API Error:', data);
                        setErrorDetails(data.error || 'Unknown error');
                        setStatus('error');
                    }
                })
                .catch(err => {
                    console.error('Confirm API Network Error:', err);
                    setStatus('error');
                });
        } else {
            // If no payment intent, redirect home
            console.warn('No payment_intent in URL, redirecting...');
            router.push('/');
        }
    }, [searchParams, clearCart, router]);

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
                        {orderId && <p className={styles.orderId}>Order #{orderId.slice(-4).toUpperCase()}</p>}
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1>Something went wrong</h1>
                        <p>We received your payment but couldn't finalize the order details. Please contact support.</p>
                        {errorDetails && <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}><strong>Error Details:</strong> {errorDetails}</p>}
                        {orderId && <p className={styles.orderId} style={{ marginTop: '1rem' }}>Reference: {orderId.slice(-4).toUpperCase()}</p>}
                    </>
                )}

                <div className={styles.actions}>
                    <Link href="/">
                        <button className={styles.btnPrimary}>Back to Home</button>
                    </Link>
                    <Link href="/orders">
                        <button className={styles.btnSecondary}>View Order History</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
