import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TrashActions from './TrashActions';
import styles from '../../admin.module.css';

export default async function TrashRestaurants() {
    const deletedRestaurants = await prisma.restaurant.findMany({
        where: {
            deletedAt: {
                not: null
            }
        },
        include: {
            owner: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { deletedAt: 'desc' }
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <Link href="/admin/restaurants" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Restaurants
                    </Link>
                    <h1 className={styles.pageTitle} style={{ color: '#dc3545' }}>Trash (Deleted Restaurants)</h1>
                    <p className={styles.pageSubtitle}>
                        {deletedRestaurants.length} restaurants waiting to be permanently deleted after 30 days.
                    </p>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Restaurant</th>
                            <th>Owner</th>
                            <th>Deleted At</th>
                            <th>Scheduled Cleanup</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deletedRestaurants.map(r => {
                            const deletedDate = r.deletedAt ? new Date(r.deletedAt) : new Date();
                            const cleanupDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                            
                            return (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: '600' }}>{r.name}</td>
                                    <td>
                                        <div>
                                            <div>{r.owner?.name || 'N/A'}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{r.owner?.email}</div>
                                        </div>
                                    </td>
                                    <td>{deletedDate.toLocaleDateString()}</td>
                                    <td style={{ color: '#dc3545' }}>{cleanupDate.toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <TrashActions restaurantId={r.id} restaurantName={r.name} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {deletedRestaurants.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIconWrapper}>
                            <svg className={styles.emptyStateIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </div>
                        <p className={styles.emptyStateText}>Trash is empty.</p>
                        <p className={styles.emptyStateSubtext}>No deleted restaurants found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
