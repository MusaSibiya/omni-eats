'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';

export default function CheckoutPage() {
    const { items, cartTotal } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payfastData, setPayfastData] = useState<{
        payfastParams: Record<string, string>;
        payfastUrl: string;
        orderId: string;
    } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (items.length === 0 || cartTotal < 10) return;

        setIsLoading(true);
        setError(null);

        fetch('/api/payfast/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, amount: cartTotal }),
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setPayfastData(data);
            })
            .catch((err) => {
                console.error('Failed to initiate PayFast payment:', err);
                setError(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [items, cartTotal]);

    if (items.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyContent}>
                    <h1>Your cart is empty</h1>
                    <p>Add some delicious meals before checking out.</p>
                    <Link href="/restaurants">
                        <button className={styles.btnPrimary}>Browse Menu</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <BackButton className={styles.backBtn} />
            <div className={styles.checkoutGrid}>
                {/* Left Column: Order Summary */}
                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>Order Summary</h2>
                    <div className={styles.itemsList}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.summaryItem}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemQuantity}>x{item.quantity}</span>
                                </div>
                                <span className={styles.itemPrice}>R {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span className={styles.totalAmount}>R {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.secureBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Secured by PayFast
                    </div>
                </div>

                {/* Right Column: Payment */}
                <div className={styles.paymentSection}>
                    <h2 className={styles.sectionTitle}>Payment</h2>

                    {cartTotal < 10 ? (
                        <div className={styles.paymentError}>
                            <p style={{ color: '#ef4444', fontWeight: '600' }}>
                                Minimum order total is R 10.00
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Your current total is R {cartTotal.toFixed(2)}. Please add more items to proceed.
                            </p>
                            <Link href="/restaurants">
                                <button className={styles.btnPrimary} style={{ marginTop: '1.5rem' }}>Browse Menu</button>
                            </Link>
                        </div>
                    ) : error ? (
                        <div className={styles.paymentError}>
                            <p style={{ color: '#ef4444', fontWeight: '600' }}>⚠️ Checkout Error</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
                            <button
                                className={styles.btnPrimary}
                                style={{ marginTop: '1.5rem' }}
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : isLoading || !payfastData ? (
                        <div className={styles.paymentLoading}>
                            <div className={styles.spinner}></div>
                            <p>Preparing your secure checkout...</p>
                        </div>
                    ) : (
                        <div className={styles.payfastSection}>
                            <div className={styles.payfastInfo}>
                                <img
                                    src="https://www.payfast.co.za/assets/images/logo.svg"
                                    alt="PayFast"
                                    className={styles.payfastLogo}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <p className={styles.payfastDesc}>
                                    You&apos;ll be redirected to PayFast&apos;s secure payment page to complete your order.
                                    PayFast supports credit/debit cards, EFT, and more.
                                </p>
                            </div>

                            {/* Hidden PayFast form — submitted programmatically */}
                            <form
                                ref={formRef}
                                method="POST"
                                action={payfastData.payfastUrl}
                                style={{ display: 'none' }}
                            >
                                {Object.entries(payfastData.payfastParams).map(([key, value]) => (
                                    <input key={key} type="hidden" name={key} value={value} />
                                ))}
                            </form>

                            <button
                                className={styles.payfastButton}
                                onClick={() => formRef.current?.submit()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Pay R {cartTotal.toFixed(2)} with PayFast
                            </button>

                            <p className={styles.payfastNote}>
                                🔒 256-bit SSL encryption. Your payment details are never stored on our servers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
