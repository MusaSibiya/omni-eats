
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { handleSignOut } from '@/lib/actions';
import styles from './Header.module.css';
import { Button } from '@/components/ui/Button';
import { CartDrawer } from '@/components/features/CartDrawer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCart } from '@/contexts/CartContext';

import { Session } from 'next-auth';

export const Header = ({ session: initialSession }: { session: Session | null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { data: sessionData, status } = useSession();
    const pathname = usePathname();
    const { cartCount } = useCart();

    // Use initialSession for immediate render, then sessionData when it arrives
    const session = sessionData || initialSession;

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);


    // Hide Header on Admin, Restaurant, and Driver Dashboard pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/restaurant-dashboard') || pathname?.startsWith('/driver-dashboard')) {
        return null;
    }

    const navLinks = (
        <>
            <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                Discover
            </Link>
            <Link href="/restaurants" className={`${styles.link} ${pathname === '/restaurants' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                Restaurants
            </Link>
            {!session && (
                <>
                    <Link href="/register-restaurant" className={`${styles.link} ${pathname === '/register-restaurant' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                        Partner with Us
                    </Link>
                    <Link href="/drive-with-us" className={`${styles.link} ${pathname === '/drive-with-us' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                        Drive with Us
                    </Link>
                </>
            )}
            {session && (
                <>
                    {session.user?.role === 'DRIVER' && (
                        <Link href="/driver-dashboard" className={`${styles.link} ${pathname === '/driver-dashboard' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                            Driver Portal
                        </Link>
                    )}
                    <Link href="/favorites" className={`${styles.link} ${pathname === '/favorites' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                        Favorites
                    </Link>
                    <Link href="/orders" className={`${styles.link} ${pathname === '/orders' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                        Orders
                    </Link>
                    <Link href="/profile" className={`${styles.link} ${pathname === '/profile' ? styles.active : ''}`} onClick={() => setIsMenuOpen(false)}>
                        Profile
                    </Link>
                </>
            )}
        </>
    );

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <div className={styles.container}>
                <div className={styles.logo}>
                  SOTOBE   <span> MEALS </span>
                </div>

                <nav className={styles.nav}>
                    {navLinks}
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
                    <div className={styles.authSection}>
                        {status === 'loading' && !session ? (
                            <div className={styles.loadingPulse}></div>
                        ) : session ? (
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{session.user?.name}</span>
                                <button
                                    className={styles.signOutBtn}
                                    onClick={() => handleSignOut()}
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
                    <button
                        className={styles.burgerBtn}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`} />
                        <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`} />
                        <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            <div className={`${styles.mobileNav} ${isMenuOpen ? styles.active : ''}`}>
                <div className={styles.mobileNavContainer}>
                    <div className={styles.mobileNavContent}>
                        {navLinks}
                        <div className={styles.mobileAuth}>
                            {session ? (
                                <button
                                    className={styles.mobileSignOutBtn}
                                    onClick={() => handleSignOut()}
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link href="/login" className={styles.mobileSignInBtn} onClick={() => setIsMenuOpen(false)}>
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </header>
    );
};
