import { prisma } from '@/lib/prisma';
import { updateMenuItem } from '@/lib/adminActions';
import Link from 'next/link';
import styles from '../../../../admin.module.css';
import { notFound } from 'next/navigation';

export default async function EditMenuItem({ params }: { params: Promise<{ id: string; menuId: string }> }) {
    const { menuId } = await params;
    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuId },
        include: {
            restaurant: {
                select: { id: true, name: true }
            }
        }
    });

    if (!menuItem) {
        notFound();
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Edit Menu Item</h1>
                <Link href={`/admin/restaurants/${menuItem.restaurant.id}`}>
                    <button className={styles.dangerBtn}>← Back</button>
                </Link>
            </div>

            <div className={styles.tableContainer} style={{ padding: '40px' }}>
                <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                    Restaurant: <strong style={{ color: 'var(--accent-primary)' }}>{menuItem.restaurant.name}</strong>
                </p>

                <form action={updateMenuItem.bind(null, menuItem.id)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={menuItem.name}
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
                            defaultValue={menuItem.description || ''}
                            className={styles.formTextarea}
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
                                defaultValue={Number(menuItem.price)}
                                className={styles.formInput}
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
                                defaultValue={menuItem.category}
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
                            defaultValue={menuItem.imageUrl || ''}
                            className={styles.formInput}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button type="submit" className={styles.primaryBtn}>
                            Update Menu Item
                        </button>
                        <Link href={`/admin/restaurants/${menuItem.restaurant.id}`}>
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
