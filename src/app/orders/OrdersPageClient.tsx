'use client';

import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { Pagination } from '@/components/ui/Pagination';
import styles from './page.module.css';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    menuItem: {
        name: string;
        restaurant: {
            name: string;
        };
    };
}

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
}

interface OrdersPageClientProps {
    orders: Order[];
}

const ITEMS_PER_PAGE = 5;

export default function OrdersPageClient({ orders }: OrdersPageClientProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-ZA', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(dateStr));
    };

    const activeOrders = orders.filter(o => o.status !== 'DELIVERED');
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');

    // Paginate completed orders, show all active orders
    const totalCompletedPages = Math.ceil(completedOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCompletedOrders = completedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    <BackButton className={styles.backBtn} />
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
                                                        <span className={styles.orderId}>Order #{order.id.slice(-4).toUpperCase()}</span>
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
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span className={styles.totalLabel}>Total</span>
                                                        <span className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</span>
                                                    </div>
                                                    <Link href={`/orders/${order.id}`}>
                                                        <button className={styles.primaryBtn} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Track Order</button>
                                                    </Link>
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
                                        {paginatedCompletedOrders.map((order) => (
                                            <div key={order.id} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div>
                                                        <span className={styles.orderId}>Order #{order.id.slice(-4).toUpperCase()}</span>
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
                                    {totalCompletedPages > 1 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalCompletedPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    )}
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
