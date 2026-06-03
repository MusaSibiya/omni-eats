import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import styles from '../../admin/admin.module.css';

export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get the owner's restaurants
    const ownerRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id }
    });

    if (ownerRestaurants.length === 0) {
        return (
            <div className={styles.dashboardContainer}>
                <div className={styles.premiumHeader}>
                    <h1 className={styles.dashboardTitle}>Orders Management</h1>
                </div>
                <div className={styles.premiumEmptyState}>
                    <h3 className={styles.emptyTitle}>No Restaurant Found</h3>
                    <p className={styles.emptyText}>Register a restaurant to start receiving orders.</p>
                </div>
            </div>
        );
    }

    const restaurantId = ownerRestaurants[0].id;

    // Mark notifications as read when viewing orders
    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                isRead: false,
                type: 'ORDER'
            },
            data: { isRead: true }
        });
    } catch (error) {
        console.error('Failed to clear notifications:', error);
    }

    // Fetch orders that contain at least one item from this restaurant
    const orders = await prisma.order.findMany({
        where: {
            items: {
                some: {
                    menuItem: {
                        restaurantId: restaurantId
                    }
                }
            }
        },
        include: { 
            user: true, 
            items: { 
                where: {
                    menuItem: {
                        restaurantId: restaurantId
                    }
                },
                include: { menuItem: true } 
            } 
        },
        orderBy: { createdAt: 'desc' }
    });

    const pending = orders.filter((o: any) => o.status === 'PENDING');
    const cooking = orders.filter((o: any) => o.status === 'COOKING');
    const ready = orders.filter((o: any) => o.status === 'READY');
    const outForDelivery = orders.filter((o: any) => o.status === 'OUT_FOR_DELIVERY');
    const delivered = orders.filter((o: any) => o.status === 'DELIVERED');

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.premiumHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Orders Management</h1>
                        <p className={styles.dashboardSubtitle}>
                            <span className={styles.liveIndicator}></span>
                            Track and manage your restaurant orders
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.orderGrid}>
                <DashboardOrderColumn title="Pending" orders={pending} />
                <DashboardOrderColumn title="Cooking" orders={cooking} />
                <DashboardOrderColumn title="Ready" orders={ready} />
                <DashboardOrderColumn title="Delivered" orders={[...outForDelivery, ...delivered]} />
            </div>
        </div>
    );
}

function DashboardOrderColumn({ title, orders }: { title: string, orders: any[] }) {
    return (
        <div className={styles.orderColumn}>
            <div className={styles.orderColumnHeader}>
                <h2 className={styles.orderColumnTitle}>{title}</h2>
                <span className={styles.orderBadge}>{orders.length}</span>
            </div>

            <div className={styles.orderList}>
                {orders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className={styles.orderId}>#{order.id.slice(-4).toUpperCase()}</span>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold', 
                                    color: order.deliveryType === 'PICKUP' ? '#38b2ac' : 'var(--accent-primary)',
                                    background: order.deliveryType === 'PICKUP' ? 'rgba(56, 178, 172, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginTop: '4px',
                                    width: 'fit-content'
                                }}>
                                    {order.deliveryType === 'PICKUP' ? '🛍️ PICKUP' : '🛵 DELIVERY'}
                                </span>
                            </div>
                            <span className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</span>
                        </div>
                        <p className={styles.orderItems}>
                            {order.items.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </p>
                        <div className={styles.orderFooter}>
                            <span className={styles.orderTime}>
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <DashboardStatusButtons orderId={order.id} currentStatus={order.status} deliveryType={order.deliveryType} />
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className={styles.emptyState} style={{ padding: '40px 20px', border: 'none' }}>
                        <p className={styles.emptyStateText} style={{ fontSize: '0.9rem' }}>No {title.toLowerCase()} orders</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { updateDashboardOrderStatus } from '@/lib/dashboardActions';

function DashboardStatusButtons({ orderId, currentStatus, deliveryType }: { orderId: string, currentStatus: string, deliveryType: string }) {
    return (
        <form action={async (formData) => {
            'use server';
            const newStatus = formData.get('status') as string;
            await updateDashboardOrderStatus(orderId, newStatus);
        }} className={styles.statusBtnGroup}>
            {currentStatus === 'PENDING' && (
                <button name="status" value="COOKING" className={`${styles.statusBtn} ${styles.cooking}`}>
                    Start Cooking
                </button>
            )}
            {currentStatus === 'COOKING' && (
                <button name="status" value="READY" className={`${styles.statusBtn} ${styles.ready || styles.delivered}`}>
                    {deliveryType === 'PICKUP' ? 'Ready for Pickup' : 'Mark as Ready'}
                </button>
            )}
            {currentStatus === 'READY' && (
                <>
                    {deliveryType === 'PICKUP' ? (
                        <button name="status" value="DELIVERED" className={`${styles.statusBtn} ${styles.delivered}`}>
                            Mark as Collected
                        </button>
                    ) : (
                        <span className={styles.statusCompleted}>Waiting for Driver</span>
                    )}
                </>
            )}
            {currentStatus === 'OUT_FOR_DELIVERY' && (
                <span className={styles.statusCompleted}>Out for Delivery</span>
            )}
            {currentStatus === 'DELIVERED' && (
                <span className={styles.statusCompleted}>✓ Delivered</span>
            )}
        </form>
    );
}
