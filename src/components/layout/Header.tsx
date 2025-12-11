
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import { Button } from '@/components/ui/Button';
import { CartDrawer } from '@/components/features/CartDrawer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCart } from '@/contexts/CartContext';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { data: session, status, update } = useSession();
    const pathname = usePathname();
    const { cartCount } = useCart();

    // Hide Header on Admin pages
    if (pathname.startsWith('/admin')) {
        return null;
    }

    // Re-validate session when the user navigates (e.g. after login/logout redirect)
    useEffect(() => {
        update();
    }, [pathname]); // Only run on path change, NOT on status change

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    OMNI <span>EATS</span>
                </div>

                <nav className={styles.nav}>
                    <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
                        Discover
                    </Link>
                    <Link href="/restaurants" className={`${styles.link} ${pathname === '/restaurants' ? styles.active : ''}`}>
                        Restaurants
                    </Link>
                    {status === 'authenticated' && (
                        <>
                            <Link href="/favorites" className={`${styles.link} ${pathname === '/favorites' ? styles.active : ''}`}>
                                Favorites
                            </Link>
                            <Link href="/orders" className={`${styles.link} ${pathname === '/orders' ? styles.active : ''}`}>
                                Orders
                            </Link>
                            <Link href="/profile" className={`${styles.link} ${pathname === '/profile' ? styles.active : ''}`}>
                                Profile
                            </Link>
                        </>
                    )}
                </nav>

                <div className={styles.actions}>
                    <ThemeToggle />
                    <button
                        className={styles.cartBtn}
                        aria-label="Cart"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                    </button>
                    {status === 'authenticated' ? (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{session.user?.name}</span>
                            <button
                                className={styles.signOutBtn}
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.signInLink}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </header>
    );
};
