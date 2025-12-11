import { createRestaurant } from '@/lib/adminActions';
import Link from 'next/link';
import styles from '../../admin.module.css';

export default function NewRestaurant() {
    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Add New Restaurant</h1>
            </div>

            <div className={styles.tableContainer} style={{ padding: '40px' }}>
                <form action={createRestaurant} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.formLabel}>
                            Restaurant Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className={styles.formInput}
                            placeholder="e.g., Gourmet Burgers"
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
                            placeholder="Brief description of the restaurant..."
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
                            className={styles.formInput}
                            placeholder="e.g., 25-35 min"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="cuisineType" className={styles.formLabel}>
                            Cuisine Type
                        </label>
                        <input
                            type="text"
                            id="cuisineType"
                            name="cuisineType"
                            className={styles.formInput}
                            placeholder="e.g., Italian, Japanese, Mexican"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="dietaryOptions" className={styles.formLabel}>
                            Dietary Options
                        </label>
                        <input
                            type="text"
                            id="dietaryOptions"
                            name="dietaryOptions"
                            className={styles.formInput}
                            placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image" className={styles.formLabel}>
                            Restaurant Image
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            className={styles.formInput}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Upload an image from your device (JPG, PNG, WebP)
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imageUrl" className={styles.formLabel}>
                            Or Image URL
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            className={styles.formInput}
                            placeholder="https://example.com/image.jpg"
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Alternatively, provide an image URL
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button type="submit" className={styles.primaryBtn}>
                            Create Restaurant
                        </button>
                        <Link href="/admin/restaurants">
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
