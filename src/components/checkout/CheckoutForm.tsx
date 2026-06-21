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

export default function CheckoutForm({ 
    orderId, 
    isMock = false 
}: { 
    orderId: string | null, 
    isMock?: boolean 
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart } = useCart();
    const router = useRouter();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleMockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!orderId) return;
        
        setIsLoading(true);
        // Simulate successful payment for mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Redirect to success page
        clearCart();
        router.push(`/checkout/success?orderId=${orderId}&payment_intent=mock_payment_intent`);
    };

    const handleStripeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!stripe || !elements || !orderId) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the user is redirected after the payment.
                return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error.type === 'card_error' || error.type === 'validation_error') {
            setMessage(error.message || 'An unexpected error occurred.');
        } else {
            setMessage('An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={isMock ? handleMockSubmit : handleStripeSubmit} className={styles.form}>
            {!isMock && <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />}
            {isMock && (
                <div style={{
                    padding: '1.5rem',
                    border: '1px solid rgba(255,174,0,0.3)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,174,0,0.05)',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🧪 Test Mode (Mock Payment</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        This is a test environment. Click "Complete Order to simulate successful payment.
                    </p>
                </div>
            )}
            <button disabled={isLoading || (!isMock && (!stripe || !elements))} id="submit" className={styles.button}>
                <span id="button-text">
                    {isLoading ? <div className={styles.spinner} id="spinner"></div> : isMock ? 'Complete Order' : 'Pay now'}
                </span>
            </button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message" className={styles.message}>{message}</div>}
        </form>
    );
}
