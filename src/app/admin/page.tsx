import { prisma } from '@/lib/prisma';
import styles from './admin.module.css';
import { RefreshButton } from '@/components/ui/RefreshButton';

export default async function AdminDashboard() {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true }
    });
    const totalUsers = await prisma.user.count();
    const totalRestaurants = await prisma.restaurant.count();

    const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            user: {
                select: { name: true }
            },
            items: {
                include: {
                    menuItem: {
                        select: { name: true, restaurant: { select: { name: true } } }
                    }
                }
            }
        }
    });

    // Calculate some basic dynamic growth based on total vs recent (pseudo-growth for now to avoid zero division)
    const orderGrowth = totalOrders > 0 ? ((recentOrders.length / totalOrders) * 100).toFixed(1) : '0.0';
    const revenueValue = Number(totalRevenue._sum.total || 0);

    const stats = [
        {
            label: 'Restaurants',
            value: totalRestaurants.toString(),
            growth: '+100%', // Assume all are new for demo
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
            progress: totalRestaurants > 0 ? 100 : 0
        },
        {
            label: 'Total Revenue',
            value: `R${revenueValue.toFixed(2)}`,
            growth: 'Ongoing',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9 16V8h4a2 2 0 0 1 0 4H9l3 4"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)',
            shadowColor: 'rgba(255, 107, 53, 0.4)',
            progress: revenueValue > 0 ? 100 : 0
        },
        {
            label: 'Active Users',
            value: totalUsers.toString(),
            growth: '+100%',
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
            progress: totalUsers > 0 ? 100 : 0
        },
        {
            label: 'Total Orders',
            value: totalOrders.toString(),
            growth: `+${orderGrowth}%`,
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
            progress: totalOrders > 0 ? 100 : 0
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
                        <RefreshButton className={styles.refreshBtn} />
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

                {recentOrders.length > 0 ? (
                    <div className={styles.activityList} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {recentOrders.map(order => (
                            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255,107,53,0.1)', borderRadius: '8px', color: '#FF6B35' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Order #{order.id.slice(-4).toUpperCase()} - {order.user?.name || 'Guest'}</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                            {order.items.length} items from {order.items[0]?.menuItem?.restaurant?.name || 'Multiple'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>+ R{Number(order.total).toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}
