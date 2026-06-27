'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { useCart } from '@/contexts/CartContext';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function MockCheckoutForm({ orderId, total }: { orderId: string | null, total: number }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { clearCart } = useCart();

    const handleMockPayment = async () => {
        setIsProcessing(true);
        
        // Simulate a payment delay
        setTimeout(() => {
            clearCart();
            window.location.href = `/checkout/success?orderId=${orderId}`;
        }, 1500);
    };

    return (
        <div className={styles.mockCheckout}>
            <div className={styles.mockCard}>
                <div className={styles.mockHeader}>
                    <span className={styles.mockIcon}>💳</span>
                    <h3 className={styles.mockTitle}>Test Payment (Demo Mode)</h3>
                    <p className={styles.mockDescription}>No real payment will be charged</p>
                </div>

                <div className={styles.mockAmount}>
                    <span className={styles.mockAmountLabel}>Total Amount</span>
                    <span className={styles.mockAmountValue}>R {total.toFixed(2)}</span>
                </div>

                <button
                    onClick={handleMockPayment} disabled={isProcessing} className={styles.mockButton}>
                    {isProcessing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={styles.spinner}></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        'Complete Order'
                    )}
                </button>

                <div className={styles.mockNote}>
                    This is a demo checkout for testing purposes only
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState('');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMockMode, setIsMockMode] = useState(false);
    const { items, cartTotal } = useCart();

    useEffect(() => {
        if (items.length > 0) {
            fetch(`/api/restaurants/${items[0].restaurantId}`)
                .then(res => res.json())
                .then(data => setRestaurant(data))
                .catch(err => console.error("Error fetching restaurant:", err));
        }
    }, [items]);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        // Only if there items
        if (items.length > 0) {
            setIsLoading(true);
            setErrorMsg(null);
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    amount: cartTotal,
                    deliveryAddress: deliveryAddress
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setErrorMsg(data.error);
                    } else {
                        setClientSecret(data.clientSecret);
                        setOrderId(data.orderId);
                        setIsMockMode(true); // Force mock mode for testing purposes
                    }
                })
                .catch(err => {
                    console.error("Error creating payment intent:", err);       
                    setErrorMsg("Failed to initialize payment. Please try again.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [items, cartTotal, deliveryAddress]);

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
                    <div style={{
                        background: 'rgba(255, 107, 53, 0.05)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 107, 53, 0.1)',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>
                            {restaurant?.deliveryAvailable ? '🚚' : '📍️'}
                        </span>
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {restaurant?.deliveryAvailable ? 'Delivery Order' : 'Self-Pickup Order'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {restaurant?.deliveryAvailable
                                    ? 'A driver will bring your order to you.'  
                                    : 'Please collect your order at the restaurant.'}
                            </p>
                        </div>
                    </div>

                    {restaurant?.deliveryAvailable && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 className={styles.sectionTitle}>Delivery Address</h2>
                            <div style={{ marginTop: '0.5rem' }}>
                                <AddressAutocomplete
                                    value={deliveryAddress}
                                    onChange={setDeliveryAddress}
                                    placeholder="Start typing your street address..."
                                />
                            </div>
                        </div>
                    )}

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

                    {errorMsg && (
                        <div className={styles.paymentError} style={{ marginBottom: '1.5rem', color: '#e53e3e', fontSize: '0.9rem' }}>
                            <p><strong>Error:</strong> {errorMsg}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className={styles.paymentLoading}>
                            <div className={styles.spinner}></div>
                            <p>Preparing checkout...</p>
                        </div>
                    ) : clientSecret && isMockMode ? (
                        <MockCheckoutForm orderId={orderId} total={cartTotal} />
                    ) : clientSecret ? (
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
