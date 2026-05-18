'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bike, BarChart3 } from 'lucide-react';
import styles from '../admin/admin.module.css';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Close sidebar when route changes
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const navItems = [
        { href: '/driver-dashboard', label: 'Active Runs', icon: <Bike size={20} /> },
        { href: '/driver-dashboard/reports', label: 'Rides Report', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className={styles.adminWrapper}>
            {/* Mobile Header Toggle */}
            <div className={styles.mobileTopBar}>
                <div className={styles.logo}>
                    SOTOBE <span>MEALS</span>
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
                        SOTOBE <span>MEALS</span>
                    </div>
                    <div className={styles.adminBadge} style={{ background: 'var(--accent-primary)', boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}>Driver Portal</div>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className={styles.navIcon} style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                            <span>{item.label}</span>
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

            <main className={styles.mainContent} style={{ padding: '32px' }}>
                {children}
            </main>
        </div>
    );
}
