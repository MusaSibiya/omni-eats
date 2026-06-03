'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from '../admin/admin.module.css'; // Reuse admin styles

export default function RestaurantDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Fetch unread notifications count
    const fetchUnreadCount = React.useCallback(async () => {
        try {
            const res = await fetch('/api/notifications/unread-count');
            const data = await res.json();
            if (data.count !== undefined) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    React.useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Close sidebar when route changes
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const navItems = [
        { href: '/restaurant-dashboard', label: 'Overview', icon: '📊' },
        { href: '/restaurant-dashboard/menu', label: 'Menu', icon: '🍽️' },
        { href: '/restaurant-dashboard/orders', label: 'Orders', icon: '📦' },
        { href: '/restaurant-dashboard/reports', label: 'Reports', icon: '📈' },
        { href: '/restaurant-dashboard/profile', label: 'Profile', icon: '🏪' },
    ];

    return (
        <div className={styles.adminWrapper}>
            {/* Mobile Header Toggle */}
            <div className={styles.mobileTopBar}>
                <div className={styles.logo}>
                    OMNI <span>EATS</span>
                </div>
                <button
                    className={`${styles.mobileToggle} ${isSidebarOpen ? styles.toggleOpen : ''}`}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle Navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        OMNI <span>MEALS</span>
                    </div>
                    <div className={styles.adminBadge}>Restaurant Owner</div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.label === 'Orders' && unreadCount > 0 && (
                                <span className={styles.notificationBadge}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <ThemeToggle />
                        <Link href="/" className={styles.backLink} style={{ flex: 1 }} onClick={() => setIsSidebarOpen(false)}>
                            ← Back to Site
                        </Link>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={styles.signOutBtn}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
