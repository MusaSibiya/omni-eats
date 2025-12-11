import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteRestaurant } from '@/lib/adminActions';
import styles from '../admin.module.css';

export default async function AdminRestaurants() {
    const restaurants = await prisma.restaurant.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Restaurants</h1>
                    <p className={styles.pageSubtitle}>Manage all restaurant listings and menus</p>
                </div>
                <Link href="/admin/restaurants/new">
                    <button className={styles.primaryBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add New Restaurant
                    </button>
                </Link>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Delivery Time</th>
                            <th>Rating</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(r => (
                            <tr key={r.id}>
                                <td style={{ fontWeight: '600' }}>{r.name}</td>
                                <td>{r.deliveryTime}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="var(--accent-primary)" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                        <span>{r.rating.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <Link href={`/admin/restaurants/${r.id}`}>
                                            <button className={styles.primaryBtn} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                                Edit
                                            </button>
                                        </Link>
                                        <form action={async () => {
                                            'use server';
                                            await deleteRestaurant(r.id);
                                        }} style={{ display: 'inline' }}>
                                            <button className={styles.dangerBtn}>Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {restaurants.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIconWrapper}>
                            <svg className={styles.emptyStateIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                            </svg>
                        </div>
                        <p className={styles.emptyStateText}>No restaurants found.</p>
                        <p className={styles.emptyStateSubtext}>Add your first restaurant to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
