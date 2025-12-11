import { prisma } from '@/lib/prisma';
import styles from './admin.module.css';

export default async function AdminDashboard() {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true }
    });
    const totalUsers = await prisma.user.count();
    const totalRestaurants = await prisma.restaurant.count();

    // Calculate growth percentages (mock data - you can calculate from historical data)
    const stats = [
        {
            label: 'Restaurants',
            value: totalRestaurants.toString(),
            growth: '+5.4%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            shadowColor: 'rgba(245, 158, 11, 0.4)',
            progress: 45
        },
        {
            label: 'Total Revenue',
            value: `R${Number(totalRevenue._sum.total || 0).toFixed(2)}`,
            growth: '+12.5%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)',
            shadowColor: 'rgba(255, 107, 53, 0.4)',
            progress: 75
        },
        {
            label: 'Active Users',
            value: totalUsers.toString(),
            growth: '+23.1%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
            shadowColor: 'rgba(100, 116, 139, 0.4)',
            progress: 88
        },
        {
            label: 'Total Orders',
            value: totalOrders.toString(),
            growth: '+8.2%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M9 14l2 2 4-4"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #1A1D23 0%, #30343a 100%)',
            shadowColor: 'rgba(26, 29, 35, 0.4)',
            progress: 62
        },
    ];

    return (
        <div className={styles.dashboardContainer}>
            {/* Premium Header */}
            <div className={styles.premiumHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
                        <p className={styles.dashboardSubtitle}>
                            <span className={styles.liveIndicator}></span>
                            Real-time business metrics
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.refreshBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className={styles.premiumStatsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.premiumStatCard}>
                        <div className={styles.statCardGlass}></div>

                        <div className={styles.statCardHeader}>
                            <div className={styles.statIconContainer} style={{ background: stat.gradient }}>
                                {stat.icon}
                            </div>
                            <div className={styles.statGrowth} style={{ color: stat.isPositive ? '#10b981' : '#ef4444' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    {stat.isPositive ? (
                                        <polyline points="18 15 12 9 6 15"></polyline>
                                    ) : (
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    )}
                                </svg>
                                {stat.growth}
                            </div>
                        </div>

                        <div className={styles.statCardBody}>
                            <h3 className={styles.statCardLabel}>{stat.label}</h3>
                            <p className={styles.statCardValue}>{stat.value}</p>
                        </div>

                        <div className={styles.statCardFooter}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${stat.progress}%`,
                                        background: stat.gradient
                                    }}
                                ></div>
                            </div>
                            <span className={styles.progressLabel}>{stat.progress}% of target</span>
                        </div>

                        <div className={styles.statCardShine}></div>
                    </div>
                ))}
            </div>

            {/* Premium Activity Section */}
            <div className={styles.premiumSection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Recent Activity</h2>
                        <p className={styles.sectionSubtitle}>Track your latest business operations</p>
                    </div>
                </div>

                <div className={styles.premiumEmptyState}>
                    <div className={styles.emptyStateGlow}></div>
                    <div className={styles.emptyIconWrapper}>
                        <svg className={styles.emptyIcon} width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No Recent Activity</h3>
                    <p className={styles.emptyText}>Your recent business activity will appear here</p>
                </div>
            </div>
        </div>
    );
}
