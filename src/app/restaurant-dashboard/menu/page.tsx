import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteMenuItem } from '@/lib/dashboardActions';
import styles from '../../admin/admin.module.css';

export default async function MenuManagementPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Fetch owner's restaurant
    const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id },
        include: {
            menuItems: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    const restaurant = restaurants[0];

    if (!restaurant) {
        return (
            <div className={styles.dashboardContainer}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h1>No Restaurant Found</h1>
                    <p>You need to register a restaurant first.</p>
                </div>
            </div>
        );
    }

    if (restaurant.status !== 'APPROVED') {
        return (
            <div className={styles.dashboardContainer}>
                <div style={{ padding: '2rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                    <h2>Restaurant Not Approved</h2>
                    <p>Your restaurant must be approved before you can manage the menu.</p>
                    <p>Current status: <strong>{restaurant.status}</strong></p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.premiumHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Menu Management</h1>
                        <p className={styles.dashboardSubtitle}>
                            <span className={styles.liveIndicator}></span>
                            Manage your restaurant's menu items
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link href="/restaurant-dashboard/menu/new">
                            <button className={styles.refreshBtn} style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)', border: 'none' }}>
                                + Add Menu Item
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{restaurant.name}</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    Total Menu Items: <strong style={{ color: 'var(--accent-primary)' }}>{restaurant.menuItems.length}</strong>
                </p>
            </div>

            {/* Menu Items Grid */}
            {restaurant.menuItems.length === 0 ? (
                <div className={styles.premiumEmptyState}>
                    <div className={styles.emptyStateGlow}></div>
                    <div className={styles.emptyIconWrapper}>
                        <svg className={styles.emptyIcon} width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3h18v18H3z"></path>
                            <path d="M3 9h18"></path>
                            <path d="M9 21V9"></path>
                        </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No Menu Items Yet</h3>
                    <p className={styles.emptyText}>Start by adding your first menu item</p>
                    <Link href="/restaurant-dashboard/menu/new">
                        <button style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            + Add Your First Item
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {restaurant.menuItems.map((item) => (
                        <div key={item.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}>
                            {item.imageUrl && (
                                <div style={{ height: '180px', overflow: 'hidden', background: '#1a1a1a' }}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{item.name}</h3>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: 'rgba(255, 107, 53, 0.15)',
                                        color: 'var(--accent-primary)',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        R{Number(item.price).toFixed(2)}
                                    </span>
                                </div>
                                {item.description && (
                                    <p style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.9rem',
                                        marginBottom: '1rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {item.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(100, 116, 139, 0.2)',
                                        color: 'rgba(255,255,255,0.7)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem'
                                    }}>
                                        {item.category}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/restaurant-dashboard/menu/${item.id}/edit`} style={{ flex: 1 }}>
                                        <button style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}>
                                            Edit
                                        </button>
                                    </Link>
                                    <form action={deleteMenuItem.bind(null, item.id)} style={{ flex: 1 }}>
                                        <button
                                            type="submit"
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
