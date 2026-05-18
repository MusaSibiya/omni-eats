import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createMenuItem } from '@/lib/dashboardActions';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from '../../../admin/admin.module.css';
import formStyles from '../../dashboard-forms.module.css';

export default async function NewMenuItemPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Fetch owner's restaurant
    const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, name: true, status: true }
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
        redirect('/restaurant-dashboard/menu');
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.premiumHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Add Menu Item</h1>
                        <p className={styles.dashboardSubtitle}>
                            Adding item to: <strong style={{ color: 'var(--accent-primary)' }}>{restaurant.name}</strong>
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
                <form action={createMenuItem.bind(null, restaurant.id)} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="name" className={formStyles.formLabel}>
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className={formStyles.input}
                            placeholder="e.g., Signature Seafood Pasta"
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
                            className={formStyles.textarea}
                            placeholder="Describe the ingredients and flavors..."
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
                                className={formStyles.input}
                                placeholder="0.00"
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
                                className={formStyles.select}
                            >
                                <option value="">Select category...</option>
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
                            Item Image
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            className={formStyles.input}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>
                            Upload a photo from your gallery.
                        </p>
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
                            Save Menu Item
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
