import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateMenuItem } from '@/lib/dashboardActions';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from '../../../../admin/admin.module.css';
import formStyles from '../../../dashboard-forms.module.css';

export default async function EditMenuItemPage({ params }: { params: Promise<{ itemId: string }> }) {
    const { itemId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const menuItem = await prisma.menuItem.findUnique({
        where: { id: itemId },
        include: { restaurant: true }
    });

    if (!menuItem) {
        notFound();
    }

    // Verify ownership
    if (menuItem.restaurant.ownerId !== session.user.id) {
        redirect('/restaurant-dashboard/menu');
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.premiumHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Edit Menu Item</h1>
                        <p className={styles.dashboardSubtitle}>
                            Editing: <strong style={{ color: 'var(--accent-primary)' }}>{menuItem.name}</strong>
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link href="/restaurant-dashboard/menu">
                            <button className={styles.refreshBtn} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                ← Back to Menu
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className={formStyles.formContainer}>
                <form action={updateMenuItem.bind(null, menuItem.id)} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="name" className={formStyles.formLabel}>
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={menuItem.name}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={formStyles.formGroup}>
                        <label htmlFor="description" className={formStyles.formLabel}>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            defaultValue={menuItem.description || ''}
                            className={formStyles.textarea}
                        />
                    </div>

                    <div className={formStyles.grid}>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="price" className={formStyles.formLabel}>
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
                                className={formStyles.input}
                            />
                        </div>

                        <div className={formStyles.formGroup}>
                            <label htmlFor="category" className={formStyles.formLabel}>
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                defaultValue={menuItem.category}
                                className={formStyles.select}
                            >
                                <option value="Starters">Starters</option>
                                <option value="Mains">Mains</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Drinks">Drinks</option>
                                <option value="Sides">Sides</option>
                                <option value="Low-Carb">Low-Carb</option>
                                <option value="Keto-Calorie">Keto-Calorie</option>
                                <option value="Meat-Based">Meat-Based</option>
                                <option value="Family">Family</option>
                            </select>
                        </div>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label htmlFor="image" className={formStyles.formLabel}>
                            Item Image (Leave empty to keep current)
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            className={formStyles.input}
                        />
                        {menuItem.imageUrl && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>
                                Current image: <a href={menuItem.imageUrl} target="_blank" style={{ color: 'var(--accent-primary)' }}>View Image</a>
                            </p>
                        )}
                    </div>

                    <div className={formStyles.buttonGroup}>
                        <button type="submit" style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #FF6B35 0%, #E85D2A 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                        }}>
                            Save Changes
                        </button>
                        <Link href="/restaurant-dashboard/menu" style={{ flex: 1 }}>
                            <button type="button" className={formStyles.input} style={{
                                width: '100%',
                                padding: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
