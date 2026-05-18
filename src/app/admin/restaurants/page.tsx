import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteRestaurant } from '@/lib/adminActions';
import { ApprovalButtons } from './ApprovalButtons';
import DeleteRestaurantButton from './DeleteRestaurantButton';
import DownloadRestaurantsButton from './DownloadRestaurantsButton';
import styles from '../admin.module.css';

import AdminSearch from '../AdminSearch';

export default async function AdminRestaurants(props: { searchParams: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const allFetched = await prisma.restaurant.findMany({
        where: query ? {
            OR: [
                { name: { contains: query } },
                { owner: { name: { contains: query } } }
            ]
        } : undefined,
        include: {
            owner: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Filter out logically deleted restaurants
    const restaurants = allFetched.filter(r => r.deletedAt === null);

    const pendingRestaurants = restaurants.filter(r => r.status === 'PENDING');
    const approvedRestaurants = restaurants.filter(r => r.status === 'APPROVED');
    const rejectedRestaurants = restaurants.filter(r => r.status === 'REJECTED');

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: '#d48806',
            APPROVED: '#28a745',
            REJECTED: '#dc3545',
            SUSPENDED: '#6c757d'
        };
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: colors[status] || '#ccc',
                color: 'white',
                textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Restaurants</h1>
                    <p className={styles.pageSubtitle}>
                        {pendingRestaurants.length} pending • {approvedRestaurants.length} approved • {rejectedRestaurants.length} rejected
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <DownloadRestaurantsButton restaurants={restaurants} />
                    <Link href="/admin/restaurants/trash">
                        <button className={styles.secondaryBtn} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Trash
                        </button>
                    </Link>
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
            </div>

            <AdminSearch placeholder="Search restaurants by name or owner..." />

            {/* Pending Applications Section */}
            {pendingRestaurants.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d48806' }}>
                        ⏳ Pending Applications ({pendingRestaurants.length})
                    </h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Restaurant</th>
                                    <th>Owner</th>
                                    <th>Cuisine</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRestaurants.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: '600' }}>{r.name}</td>
                                        <td>
                                            <div>
                                                <div>{r.owner?.name || 'N/A'}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{r.owner?.email}</div>
                                            </div>
                                        </td>
                                        <td>{r.cuisineType}</td>
                                        <td style={{ textAlign: 'center' }}>{getStatusBadge(r.status)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <ApprovalButtons restaurantId={r.id} restaurantName={r.name} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Restaurants Section */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>All Restaurants</h2>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Delivery Time</th>
                            <th>Rating</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(r => (
                            <tr key={r.id}>
                                <td style={{ fontWeight: '600' }}>{r.name}</td>
                                <td>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {r.owner?.name || 'Admin'}
                                    </div>
                                </td>
                                <td>{getStatusBadge(r.status)}</td>
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
                                        <DeleteRestaurantButton
                                            restaurantId={r.id}
                                            restaurantName={r.name}
                                        />
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
