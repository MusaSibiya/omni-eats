import { prisma } from '@/lib/prisma';
import { createMenuItem } from '@/lib/adminActions';
import Link from 'next/link';
import styles from '../../../../admin.module.css';
import { notFound } from 'next/navigation';

export default async function NewMenuItem({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        select: { id: true, name: true }
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Add Menu Item</h1>
                <Link href={`/admin/restaurants/${restaurant.id}`}>
                    <button className={styles.dangerBtn}>← Back</button>
                </Link>
            </div>

            <div className={styles.tableContainer} style={{ padding: '40px' }}>
                <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                    Adding menu item to: <strong style={{ color: 'var(--accent-primary)' }}>{restaurant.name}</strong>
                </p>

                <form action={createMenuItem.bind(null, restaurant.id)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className={styles.formInput}
                            placeholder="e.g., Margherita Pizza"
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
                            className={styles.formTextarea}
                            placeholder="Brief description of the menu item..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className={styles.formGroup}>
                            <label htmlFor="price" className={styles.formLabel}>
                                Price (R) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                required
                                step="0.01"
                                min="0"
                                className={styles.formInput}
                                placeholder="0.00"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="category" className={styles.formLabel}>
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                className={styles.formInput}
                            >
                                <option value="">Select category...</option>
                                <option value="Starters">Starters</option>
                                <option value="Mains">Mains</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Drinks">Drinks</option>
                                <option value="Sides">Sides</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imageUrl" className={styles.formLabel}>
                            Image URL
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            className={styles.formInput}
                            placeholder="https://example.com/image.jpg (optional)"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button type="submit" className={styles.primaryBtn}>
                            Add Menu Item
                        </button>
                        <Link href={`/admin/restaurants/${restaurant.id}`}>
                            <button type="button" className={styles.dangerBtn}>
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
