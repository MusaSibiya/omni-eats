import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from './CartDrawer.module.css';
import { useCart } from '@/contexts/CartContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={`${styles.drawer} ${isOpen ? styles.visible : ''}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Your Order</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🛒</span>
                            <p>Your cart is empty.</p>
                            <Button variant="secondary" onClick={onClose}>Start Browsing</Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div
                                    className={styles.itemImage}
                                    style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none' }}
                                />
                                <div className={styles.itemDetails}>
                                    <div>
                                        <h3 className={styles.itemName}>{item.name}</h3>
                                        <p className={styles.itemPrice}>R{Number(item.price).toFixed(2)}</p>
                                    </div>
                                    <div className={styles.quantityControls}>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantity}>{item.quantity}</span>
                                        <button
                                            className={styles.controlBtn}
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    {items.length > 0 && (
                        <div className={styles.summary}>
                            <div className={styles.row}>
                                <span>Subtotal</span>
                                <span>R{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Delivery</span>
                                <span>Standard</span>
                            </div>
                            <div className={`${styles.row} ${styles.total}`}>
                                <span>Total</span>
                                <span>R{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <Link href="/checkout" style={{ width: '100%', textDecoration: 'none' }} onClick={onClose}>
                        <Button size="lg" style={{ width: '100%' }} disabled={items.length === 0}>
                            Checkout {items.length > 0 && `• R${cartTotal.toFixed(2)}`}
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
};
