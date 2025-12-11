'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './admin.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Overview', icon: '📊' },
        { href: '/admin/restaurants', label: 'Restaurants', icon: '🍽️' },
        { href: '/admin/orders', label: 'Orders', icon: '📦' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
    ];

    return (
        <div className={styles.adminWrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        OMNI <span>EATS</span>
                    </div>
                    <div className={styles.adminBadge}>Admin Panel</div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <ThemeToggle />
                        <Link href="/" className={styles.backLink} style={{ flex: 1 }}>
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
