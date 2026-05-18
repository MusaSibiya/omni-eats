import { prisma } from '@/lib/prisma';
import { updateOrderStatus } from '@/lib/adminActions';
import styles from '../admin.module.css';
import AdminSearch from '../AdminSearch';

export default async function AdminOrders(props: { searchParams: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    let orders = await prisma.order.findMany({
        include: { user: true, items: { include: { menuItem: true } } },
        orderBy: { createdAt: 'desc' }
    });

    const pending = orders.filter(o => o.status === 'PENDING');
    const cooking = orders.filter(o => o.status === 'COOKING');
    const delivered = orders.filter(o => o.status === 'DELIVERED');

    if (query) {
        const lowerQuery = query.toLowerCase();
        orders = orders.filter(o => 
            o.id.slice(-4).toLowerCase().includes(lowerQuery) || 
            (o.user?.name && o.user.name.toLowerCase().includes(lowerQuery))
        );
    }

    const filteredPending = orders.filter(o => o.status === 'PENDING');
    const filteredCooking = orders.filter(o => o.status === 'COOKING');
    const filteredDelivered = orders.filter(o => o.status === 'DELIVERED');

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Order Management</h1>
                    <p className={styles.pageSubtitle}>Track and manage all customer orders in real-time</p>
                </div>
            </div>

            <AdminSearch placeholder="Search orders by ID or customer name..." />

            <div className={styles.orderGrid}>
                <OrderColumn title="Pending" orders={filteredPending} />
                <OrderColumn title="Cooking" orders={filteredCooking} />
                <OrderColumn title="Delivered" orders={filteredDelivered} />
            </div>
        </div>
    );
}

function OrderColumn({ title, orders }: { title: string, orders: any[] }) {
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
                            <span className={styles.orderId}>#{order.id.slice(-4).toUpperCase()}</span>
                            <span className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</span>
                        </div>
                        <p className={styles.orderItems}>
                            {order.items.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </p>
                        <div className={styles.orderFooter}>
                            <span className={styles.orderTime}>
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <StatusButtons orderId={order.id} currentStatus={order.status} />
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

function StatusButtons({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    return (
        <form action={async (formData) => {
            'use server';
            const newStatus = formData.get('status') as string;
            await updateOrderStatus(orderId, newStatus);
        }} className={styles.statusBtnGroup}>
            {currentStatus === 'PENDING' && (
                <button name="status" value="COOKING" className={`${styles.statusBtn} ${styles.cooking}`}>
                    Start Cooking
                </button>
            )}
            {currentStatus === 'COOKING' && (
                <button name="status" value="DELIVERED" className={`${styles.statusBtn} ${styles.delivered}`}>
                    Deliver
                </button>
            )}
            {currentStatus === 'DELIVERED' && (
                <span className={styles.statusCompleted}>✓ Completed</span>
            )}
        </form>
    );
}
