import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import styles from '../admin/admin.module.css'; // Reuse admin styles
import { ReportDownloader } from '@/components/features/ReportDownloader';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { revalidatePath } from 'next/cache';

export default async function RestaurantDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className={styles.dashboardContainer}>
                <p>Please login to view your dashboard</p>
            </div>
        );
    }

    // Fetch owner's restaurant
    const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id },
        include: {
            _count: {
                select: {
                    menuItems: true,
                    reviews: true,
                    favorites: true
                }
            }
        }
    });

    const restaurant = restaurants[0];

    if (!restaurant) {
        return (
            <div className={styles.dashboardContainer}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h1>No Restaurant Found</h1>
                    <p>You haven't registered a restaurant yet.</p>
                    <a href="/register-restaurant" style={{ color: 'var(--accent-primary)' }}>
                        Register Your Restaurant
                    </a>
                </div>
            </div>
        );
    }

    const isPending = restaurant.status === 'PENDING';
    const isRejected = restaurant.status === 'REJECTED';
    const isApproved = restaurant.status === 'APPROVED';

    const orders = await prisma.order.findMany({
        where: {
            items: {
                some: {
                    menuItem: {
                        restaurantId: restaurant.id
                    }
                }
            }
        },
        include: {
            user: true,
            items: {
                where: {
                    menuItem: {
                        restaurantId: restaurant.id
                    }
                },
                include: { menuItem: true }
            }
        }
    });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const customers = new Set();
    const itemSales: Record<string, { name: string, category: string, count: number, revenue: number }> = {};
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

    deliveredOrders.forEach(order => {
        order.items.forEach((item: any) => {
            const revenue = Number(item.price) * item.quantity;
            totalRevenue += revenue;
            totalItemsSold += item.quantity;

            const menuItemId = item.menuItem.id;
            if (!itemSales[menuItemId]) {
                itemSales[menuItemId] = {
                    name: item.menuItem.name,
                    category: item.menuItem.category,
                    count: 0,
                    revenue: 0,
                };
            }
            itemSales[menuItemId].count += item.quantity;
            itemSales[menuItemId].revenue += revenue;
        });
        customers.add(order.userId);
    });

    const activeCustomers = customers.size;
    const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const stats = [
        {
            label: 'Total Revenue',
            value: `R${totalRevenue.toFixed(2)}`,
            growth: totalRevenue > 0 ? '+15.4%' : '+0.0%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 4v16"></path>
                    <path d="M7 4h6a4 4 0 0 1 0 8H7"></path>
                    <path d="M11 12l4 8"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)',
            shadowColor: 'rgba(255, 107, 53, 0.4)',
            progress: totalRevenue > 0 ? 100 : 0
        },
        {
            label: 'Menu Items',
            value: (restaurant._count?.menuItems || 0).toString(),
            growth: (restaurant._count?.menuItems || 0) > 0 ? '+100%' : '+0.0%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M9 14l2 2 4-4"></path>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.4)',
            progress: (restaurant._count?.menuItems || 0) > 0 ? 100 : 0
        },
        {
            label: 'Active Customers',
            value: activeCustomers.toString(),
            growth: activeCustomers > 0 ? '+12.5%' : '+0.0%',
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
            progress: activeCustomers > 0 ? 100 : 0
        },
        {
            label: 'Rating',
            value: restaurant.rating.toFixed(1),
            growth: restaurant.rating > 0 ? '+5.0%' : '+0.0%',
            isPositive: true,
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            ),
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            shadowColor: 'rgba(245, 158, 11, 0.4)',
            progress: (restaurant.rating / 5) * 100
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
                    <div className={styles.headerActions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <ReportDownloader 
                            data={{
                                restaurantName: restaurant.name,
                                metrics: {
                                    totalRevenue,
                                    totalOrders: deliveredOrders.length,
                                    itemsSold: totalItemsSold,
                                    uniqueCustomers: activeCustomers
                                },
                                topItems,
                                orders: deliveredOrders.map((o: any) => ({
                                    id: o.id.slice(-4).toUpperCase(),
                                    date: new Date(o.createdAt).toISOString().split('T')[0],
                                    customer: o.user?.name || 'Guest',
                                    email: o.user?.email || 'N/A',
                                    status: o.status,
                                    items: o.items.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join('; '),
                                    total: o.items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0)
                                }))
                            }} 
                        />
                        <RefreshButton className={styles.refreshBtn} />
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{restaurant.name}</h2>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                background: isApproved ? 'rgba(16, 185, 129, 0.15)' : isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isApproved ? '#10b981' : isPending ? '#f59e0b' : '#ef4444',
                                border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.3)' : isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {restaurant.status}
                            </span>
                            {isApproved && (
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: restaurant.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: restaurant.isOpen ? '#10b981' : '#ef4444',
                                    border: `1px solid ${restaurant.isOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                }}>
                                    {restaurant.isOpen ? 'Open' : 'Closed'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending/Rejected Notices */}
            {isPending && (
                <div style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>â³ Awaiting Approval</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Your restaurant application is under review by our admin team.</p>
                </div>
            )}

            {isRejected && (
                <div style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>âŒ Application Rejected</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>Unfortunately, your restaurant application was not approved. Please contact support.</p>
                </div>
            )}

            {/* Premium Stats Grid - Only show if approved */}
            {isApproved && (
                <>
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
                                <h2 className={styles.sectionTitle}>Recent Orders Activity</h2>
                                <p className={styles.sectionSubtitle}>Track your latest business operations</p>
                            </div>
                        </div>

                        {orders.length > 0 ? (
                            <div className={styles.activityList} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(order => (
                                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.5rem', background: 'rgba(255,107,53,0.1)', borderRadius: '8px', color: '#FF6B35' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>New Order #{order.id.slice(-4).toUpperCase()}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{order.items.length} items ordered. Status: {order.status}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#10b981' }}>+ R{order.items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0).toFixed(2)}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                            
                                            {order.status === 'PENDING' && (
                                                <form action={async () => {
                                                    'use server';
                                                    await prisma.order.update({ where: { id: order.id }, data: { status: 'COOKING' } });
                                                    revalidatePath('/restaurant-dashboard');
                                                }}>
                                                    <button type="submit" style={{ padding: '6px 12px', background: 'var(--accent-secondary, #3db8b0)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Accept & Cook</button>
                                                </form>
                                            )}
                                            {order.status === 'COOKING' && (
                                                <form action={async () => {
                                                    'use server';
                                                    await prisma.order.update({ where: { id: order.id }, data: { status: 'READY' } });
                                                    revalidatePath('/restaurant-dashboard');
                                                }}>
                                                    <button type="submit" style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Mark Ready</button>
                                                </form>
                                            )}
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
                </>
            )}
        </div>
    );
}
