import { prisma } from '@/lib/prisma';
import { updateRestaurant, createMenuItem, deleteMenuItem } from '@/lib/adminActions';
import Link from 'next/link';
import styles from '../../admin.module.css';
import { notFound } from 'next/navigation';

export default async function EditRestaurant({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            menuItems: {
                orderBy: { category: 'asc' }
            }
        }
    });

    if (!restaurant) {
        notFound();
    }

    // Group menu items by category
    const menuByCategory = restaurant.menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof restaurant.menuItems>);

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Edit Restaurant</h1>
                <Link href="/admin/restaurants">
                    <button className={styles.dangerBtn}>← Back</button>
                </Link>
            </div>

            {/* Restaurant Details Form */}
            <div className={styles.tableContainer} style={{ padding: '40px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>
                    Restaurant Details
                </h2>
                <form action={updateRestaurant.bind(null, restaurant.id)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Restaurant Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={restaurant.name}
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.formLabel}>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            defaultValue={restaurant.description || ''}
                            className={styles.formTextarea}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="deliveryTime" className={styles.formLabel}>
                            Delivery Time *
                        </label>
                        <input
                            type="text"
                            id="deliveryTime"
                            name="deliveryTime"
                            required
                            defaultValue={restaurant.deliveryTime || ''}
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imageUrl" className={styles.formLabel}>
                            Image URL
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            defaultValue={restaurant.imageUrl || ''}
                            className={styles.formInput}
                        />
                    </div>

                    <button type="submit" className={styles.primaryBtn}>
                        Update Restaurant
                    </button>
                </form>
            </div>

            {/* Menu Items Section */}
            <div className={styles.tableContainer} style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Menu Items
                    </h2>
                    <Link href={`/admin/restaurants/${restaurant.id}/menu/new`}>
                        <button className={styles.primaryBtn}>
                            + Add Menu Item
                        </button>
                    </Link>
                </div>

                {Object.keys(menuByCategory).length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>🍽️</div>
                        <p className={styles.emptyStateText}>No menu items yet. Add your first item!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {Object.entries(menuByCategory).map(([category, items]) => (
                            <div key={category}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    marginBottom: '16px',
                                    color: 'var(--accent-primary)',
                                    borderBottom: '2px solid var(--border-color)',
                                    paddingBottom: '8px'
                                }}>
                                    {category}
                                </h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {items.map(item => (
                                        <div key={item.id} className={styles.orderCard} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                                    {item.name}
                                                </h4>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                    {item.description}
                                                </p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                                                    R{Number(item.price).toFixed(2)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <Link href={`/admin/restaurants/${restaurant.id}/menu/${item.id}`}>
                                                    <button className={styles.primaryBtn} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                                        Edit
                                                    </button>
                                                </Link>
                                                <form action={async () => {
                                                    'use server';
                                                    await deleteMenuItem(item.id);
                                                }}>
                                                    <button className={styles.dangerBtn}>Delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
