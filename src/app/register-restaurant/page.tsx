'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Footer } from '@/components/layout/Footer';
import styles from './page.module.css';

// Mock function - replace with your actual registerRestaurant function
const registerRestaurant = async (formData: FormData) => {
    // Simulate API call
    return new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
};

export default function RegisterRestaurantPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            const res = await registerRestaurant(formData);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login?message=Restaurant+application+submitted');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.main}>
                <div className={styles.successWrapper}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>🍽️</div>
                        <h1 className={styles.successTitle}>Welcome to Sotobe Eats!</h1>
                        <p className={styles.successText}>
                            Your restaurant application has been received. We'll review it and be in touch soon!
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Register Your Restaurant</h1>
                    <p className={styles.subtitle}>Join Sotobe Eats and reach thousands of customers in your city.</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit} className={styles.form}>

                        {/* Restaurant Information Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Restaurant Information</h2>
                            <p className={styles.sectionNote}>Let us know the basics about your restaurant</p>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Restaurant Name *</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        name="name"
                                        placeholder="e.g., Soweto Gold"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Dietary Options</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        name="dietaryOptions"
                                        placeholder="e.g., Vegetarian, Halal friendly"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    name="description"
                                    placeholder="Tell customers about your restaurant..."
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Cuisine Type *</label>
                                    <select className={styles.select} name="cuisineType" required>
                                        <option value="">Select cuisine type</option>
                                        <option value="Kasi / Traditional">Kasi / Traditional</option>
                                        <option value="Shisa Nyama">Shisa Nyama</option>
                                        <option value="Indian / Durban">Indian / Durban</option>
                                        <option value="Fast Food">Fast Food</option>
                                        <option value="Fine Dining">Fine Dining</option>
                                        <option value="Cafe">Cafe</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Delivery Time</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        name="deliveryTime"
                                        placeholder="30-45 min"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Restaurant Image</label>
                                {imagePreview ? (
                                    <div className={styles.imagePreview}>
                                        <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                                        <button type="button" onClick={removeImage} className={styles.removeImage}>
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <label className={styles.uploadZone}>
                                        <div className={styles.uploadIcon}>�</div>
                                        <div className={styles.uploadText}>Upload Restaurant Image</div>
                                        <div className={styles.uploadSubtext}>Click to browse or drag and drop</div>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            className={styles.hiddenInput}
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Contact Information</h2>
                            <p className={styles.sectionNote}>Let us know how to reach you</p>

                            {session ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                                        Hey, {session.user?.name}!
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        We'll use your existing account details.
                                    </p>
                                    <input type="hidden" name="email" value={session.user?.email || ''} />
                                    <input type="hidden" name="name" value={session.user?.name || ''} />
                                </div>
                            ) : (
                                <>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Your Name *</label>
                                            <input
                                                className={styles.input}
                                                type="text"
                                                name="ownerName"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Email Address *</label>
                                            <input
                                                className={styles.input}
                                                type="email"
                                                name="email"
                                                placeholder="owner@restaurant.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Phone Number *</label>
                                            <input
                                                className={styles.input}
                                                type="tel"
                                                name="phone"
                                                placeholder="+27 12 345 6789"
                                                required
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Restaurant Address</label>
                                            <input
                                                className={styles.input}
                                                type="text"
                                                name="address"
                                                placeholder="123 Main Street, Johannesburg"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {session && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Restaurant Address</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        name="address"
                                        placeholder="123 Main Street, Johannesburg"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

