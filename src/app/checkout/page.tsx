'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { items, cartTotal } = useCart();

    useEffect(() => {
        if (items.length > 0) {
            fetch(`/api/restaurants/${items[0].restaurantId}`)
                .then(res => res.json())
                .then(data => setRestaurant(data))
                .catch(err => console.error("Error fetching restaurant:", err));
        }
    }, [items]);

    const handlePayFastCheckout = async () => {
        if (items.length === 0) return;
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/api/payfast/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    items, 
                    amount: cartTotal,
                    deliveryAddress: deliveryAddress
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to initialize PayFast checkout');
            }

            // Redirect to PayFast
            window.location.href = data.url;
        } catch (err: any) {
            console.error("PayFast checkout error:", err);
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
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
                            {restaurant?.deliveryAvailable ? '🛵' : '🛍️'}
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

                {/* Right Column: Payment Details */}
                <div className={styles.paymentSection}>
                    <h2 className={styles.sectionTitle}>Payment Details</h2>
                    
                    {errorMsg && (
                        <div className={styles.paymentError} style={{ marginBottom: '1.5rem', color: '#e53e3e', fontSize: '0.9rem' }}>
                            <p><strong>Error:</strong> {errorMsg}</p>
                        </div>
                    )}

                    <div className={styles.payfastContainer} style={{ 
                        background: '#f7fafc', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Image 
                                src="https://www.payfast.co.za/wp-content/uploads/2022/04/PayFast-Logo-Color.svg" 
                                alt="PayFast" 
                                width={150} 
                                height={40} 
                                style={{ margin: '0 auto' }}
                            />
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Pay securely using your preferred local method including <strong>Instant EFT, Credit Card, or Capitec Pay</strong>.
                        </p>

                        <button 
                            className={styles.btnPrimary} 
                            onClick={handlePayFastCheckout}
                            disabled={isLoading}
                            style={{ 
                                width: '100%', 
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className={styles.spinner} style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    Pay R {cartTotal.toFixed(2)} with PayFast
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                            You will be redirected to PayFast to complete your payment securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
