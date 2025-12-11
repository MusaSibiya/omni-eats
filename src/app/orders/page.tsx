
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default async function OrdersPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect('/login');
    }

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: {
                                select: { name: true }
                            }
                        }
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const activeOrders = orders.filter(o => o.status !== 'DELIVERED');
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-ZA', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(date));
    };

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.title}>My Orders</h1>
                        <Link href="/restaurants">
                            <button className={styles.browseBtn}>Browse Restaurants</button>
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>🍽️</div>
                            <h2 className={styles.emptyTitle}>No orders yet</h2>
                            <p className={styles.emptyText}>Start exploring restaurants and place your first order!</p>
                            <Link href="/restaurants">
                                <button className={styles.primaryBtn}>Browse Restaurants</button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {activeOrders.length > 0 && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Active Orders</h2>
                                    <div className={styles.ordersList}>
                                        {activeOrders.map((order) => (
                                            <div key={order.id} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div>
                                                        <span className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</span>
                                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className={styles.orderItems}>
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className={styles.itemRow}>
                                                            <div className={styles.itemInfo}>
                                                                <span className={styles.itemName}>{item.quantity}× {item.menuItem.name}</span>
                                                                <span className={styles.itemRestaurant}>{item.menuItem.restaurant.name}</span>
                                                            </div>
                                                            <span className={styles.itemPrice}>R{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.orderFooter}>
                                                    <span className={styles.totalLabel}>Total</span>
                                                    <span className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {completedOrders.length > 0 && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Order History</h2>
                                    <div className={styles.ordersList}>
                                        {completedOrders.map((order) => (
                                            <div key={order.id} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div>
                                                        <span className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</span>
                                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                        ✓ {order.status}
                                                    </span>
                                                </div>
                                                <div className={styles.orderItems}>
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className={styles.itemRow}>
                                                            <div className={styles.itemInfo}>
                                                                <span className={styles.itemName}>{item.quantity}× {item.menuItem.name}</span>
                                                                <span className={styles.itemRestaurant}>{item.menuItem.restaurant.name}</span>
                                                            </div>
                                                            <span className={styles.itemPrice}>R{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.orderFooter}>
                                                    <span className={styles.totalLabel}>Total</span>
                                                    <span className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
