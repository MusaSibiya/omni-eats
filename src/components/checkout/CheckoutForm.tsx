'use client';

import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import styles from './CheckoutForm.module.css';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

function StripeCheckoutForm({ orderId }: { orderId: string | null }) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleStripeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stripe || !elements || !orderId) return;

        setIsLoading(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
            },
        });

        if (error.type === 'card_error' || error.type === 'validation_error') {
            setMessage(error.message || 'An unexpected error occurred.');
        } else {
            setMessage('An unexpected error occurred.');
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleStripeSubmit} className={styles.form}>
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            <button disabled={isLoading || !stripe || !elements} id="submit" className={styles.button}>
                <span id="button-text">
                    {isLoading ? <div className={styles.spinner} id="spinner"></div> : 'Pay now'}
                </span>
            </button>
            {message && <div id="payment-message" className={styles.message}>{message}</div>}
        </form>
    );
}

function MockCheckoutForm({ orderId }: { orderId: string | null }) {
    const { clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleMockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!orderId) return;
        
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}&payment_intent=mock_payment_intent`);
    };

    return (
        <form id="payment-form" onSubmit={handleMockSubmit} className={styles.form}>
            <div style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,174,0,0.3)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,174,0,0.05)',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🧪 Test Mode (Mock Payment)</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    This is a test environment. Click "Complete Order" to simulate successful payment.
                </p>
            </div>
            <button disabled={isLoading} id="submit" className={styles.button}>
                <span id="button-text">
                    {isLoading ? <div className={styles.spinner} id="spinner"></div> : 'Complete Order'}
                </span>
            </button>
        </form>
    );
}

export default function CheckoutForm({ 
    orderId, 
    isMock = false 
}: { 
    orderId: string | null, 
    isMock?: boolean 
}) {
    return isMock ? (
        <MockCheckoutForm orderId={orderId} />
    ) : (
        <StripeCheckoutForm orderId={orderId} />
    );
}
