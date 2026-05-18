import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { ReportDownloader } from '@/components/features/ReportDownloader';

export default async function ReportsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get the owner's restaurant
    const ownerRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id }
    });

    if (ownerRestaurants.length === 0) {
        return (
            <div className={styles.reportsContainer}>
                <h1 className={styles.title}>Analytics & Reports</h1>
                <p>Register a restaurant first to see your analytics.</p>
            </div>
        );
    }

    const restaurant = ownerRestaurants[0];

    // Fetch ALL delivered orders containing items from this restaurant
    const deliveredOrders = await prisma.order.findMany({
        where: {
            status: 'DELIVERED',
            items: {
                some: {
                    menuItem: { restaurantId: restaurant.id }
                }
            }
        },
        include: {
            items: {
                where: {
                    menuItem: { restaurantId: restaurant.id }
                },
                include: { menuItem: true }
            }
        }
    });

    // Calculate metrics and trends
    let totalRevenue = 0;
    let totalItemsSold = 0;
    const uniqueCustomers = new Set();
    const itemSales: Record<string, { name: string, category: string, count: number, revenue: number }> = {};
    
    // Trend calculation variables
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;

    let currentPeriodOrdersCount = 0;
    let previousPeriodOrdersCount = 0;

    // 2. Generate past 7 days chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            dateStr: d.toISOString().split('T')[0],
            display: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0
        };
    });

    deliveredOrders.forEach(order => {
        uniqueCustomers.add(order.userId);
        
        const orderDate = new Date(order.createdAt);
        const isCurrentPeriod = orderDate >= thirtyDaysAgo;
        const isPreviousPeriod = orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;

        if (isCurrentPeriod) currentPeriodOrdersCount++;
        if (isPreviousPeriod) previousPeriodOrdersCount++;

        // Track daily revenue
        const orderDateStr = orderDate.toISOString().split('T')[0];
        const dayRef = last7Days.find(d => d.dateStr === orderDateStr);

        order.items.forEach((item: any) => {
            const revenue = Number(item.price) * item.quantity;
            totalRevenue += revenue;
            totalItemsSold += item.quantity;

            if (isCurrentPeriod) currentPeriodRevenue += revenue;
            if (isPreviousPeriod) previousPeriodRevenue += revenue;

            if (dayRef) {
                dayRef.revenue += revenue;
            }

            // Track item bestsellers
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
    });

    // Sort top items
    const topItems = Object.values(itemSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5 bestsellers

    // Calculate max daily revenue for chart scaling
    const maxDailyRevenue = Math.max(...last7Days.map(d => d.revenue), 100);

    // Formulate trend strings
    const revenueGrowth = previousPeriodRevenue === 0 && currentPeriodRevenue > 0 
        ? 100 
        : previousPeriodRevenue === 0 ? 0 : ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    
    const revenueGrowthLabel = revenueGrowth > 0 ? `▲ ${revenueGrowth.toFixed(1)}% vs last 30 days` : revenueGrowth < 0 ? `▼ ${Math.abs(revenueGrowth).toFixed(1)}% vs last 30 days` : 'No change vs last 30 days';
    const revenueGrowthClass = revenueGrowth >= 0 ? styles.positiveTrend : styles.negativeTrend;

    const ordersGrowth = previousPeriodOrdersCount === 0 && currentPeriodOrdersCount > 0
        ? 100
        : previousPeriodOrdersCount === 0 ? 0 : ((currentPeriodOrdersCount - previousPeriodOrdersCount) / previousPeriodOrdersCount) * 100;
    
    const ordersGrowthLabel = ordersGrowth > 0 ? `▲ ${ordersGrowth.toFixed(1)}% vs last 30 days` : ordersGrowth < 0 ? `▼ ${Math.abs(ordersGrowth).toFixed(1)}% vs last 30 days` : 'No change vs last 30 days';
    const ordersGrowthClass = ordersGrowth >= 0 ? styles.positiveTrend : styles.negativeTrend;

    const ratingDisplay = restaurant.rating > 0 ? `${restaurant.rating.toFixed(1)} / 5.0` : 'New';

    return (
        <div className={styles.reportsContainer}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Advanced Analytics</h1>
                    <p className={styles.subtitle}>Unlock deep insights into your business performance</p>
                </div>
                <ReportDownloader 
                    data={{
                        restaurantName: restaurant.name,
                        metrics: {
                            totalRevenue,
                            totalOrders: deliveredOrders.length,
                            itemsSold: totalItemsSold,
                            uniqueCustomers: uniqueCustomers.size
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
            </div>

            {/* Top Level Insights */}
            <div className={styles.insightsPanel}>
                <div className={styles.insightStat}>
                    <div className={styles.insightLabel}>Total Lifetime Revenue</div>
                    <div className={styles.insightValue}>R{totalRevenue.toFixed(2)}</div>
                    <div className={`${styles.insightTrend} ${revenueGrowthClass}`}>
                        {revenueGrowthLabel}
                    </div>
                </div>
                <div className={styles.insightStat}>
                    <div className={styles.insightLabel}>Unique Customers</div>
                    <div className={styles.insightValue}>{uniqueCustomers.size}</div>
                    <div className={`${styles.insightTrend} ${styles.positiveTrend}`}>
                        Based on delivered orders
                    </div>
                </div>
                <div className={styles.insightStat}>
                    <div className={styles.insightLabel}>Total Orders Completed</div>
                    <div className={styles.insightValue}>{deliveredOrders.length}</div>
                    <div className={`${styles.insightTrend} ${ordersGrowthClass}`}>
                        {ordersGrowthLabel}
                    </div>
                </div>
                <div className={styles.insightStat}>
                    <div className={styles.insightLabel}>Items Sold</div>
                    <div className={styles.insightValue}>{totalItemsSold}</div>
                    <div className={`${styles.insightTrend} ${styles.positiveTrend}`}>
                        Current Rating: {ratingDisplay}
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className={styles.chartSection}>
                <h2 className={styles.cardTitle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    Revenue Past 7 Days
                </h2>
                <div className={styles.barChart}>
                    {last7Days.map((day, i) => (
                        <div key={i} className={styles.barCol}>
                            <div 
                                className={styles.barFill} 
                                style={{ height: `${Math.max((day.revenue / maxDailyRevenue) * 100, 2)}%` }}
                                data-value={`R${day.revenue.toFixed(0)}`}
                            ></div>
                            <span className={styles.barLabel}>{day.display}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bestseller Grid */}
            <div className={styles.bestsellerGrid}>
                <div className={styles.glassCard} style={{ gridColumn: '1 / -1' }}>
                    <h2 className={styles.cardTitle}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Top Menu Performers
                    </h2>
                    
                    {topItems.length > 0 ? (
                        <div>
                            {topItems.map((item, index) => (
                                <div key={index} className={styles.itemRow}>
                                    <div className={styles.itemNameInfo}>
                                        <span className={`${styles.rankBadge} ${index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : index === 2 ? styles.rank3 : ''}`}>
                                            #{index + 1}
                                        </span>
                                        <div>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemCategory}>{item.category}</div>
                                        </div>
                                    </div>
                                    <div className={styles.itemStats}>
                                        <div className={styles.itemRevenue}>R{item.revenue.toFixed(2)}</div>
                                        <div className={styles.itemCount}>{item.count} orders</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>Not enough data to display bestsellers. Need more delivered orders!</p>
                    )}
                </div>
            </div>

        </div>
    );
}
