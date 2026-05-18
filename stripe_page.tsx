'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState('');
    const [orderId, setOrderId] = useState<string | null>(null);
    const { items, cartTotal } = useCart();

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        // Only if there items
        if (items.length > 0) {
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, amount: cartTotal }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setClientSecret(data.clientSecret);
                    setOrderId(data.orderId);
                });
        }
    }, [items, cartTotal]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#ff6b35', // Brand Orange
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

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
        )
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.checkoutGrid}>
                {/* Left Column: Order Summary */}
                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>Order Summary</h2>
                    <div className={styles.itemsList}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.summaryItem}>
                                {/* Placeholder for item image if we have it later */}
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
                        Secure SSL Encryption
                    </div>
                </div>

                {/* Right Column: Payment Form */}
                <div className={styles.paymentSection}>
                    <h2 className={styles.sectionTitle}>Payment Details</h2>
                    {clientSecret ? (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm orderId={orderId} />
                        </Elements>
                    ) : (
                        <div className={styles.paymentLoading}>
                            <div className={styles.spinner}></div>
                            <p>Taking you to secure checkout...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
