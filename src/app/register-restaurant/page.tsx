'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function RegisterRestaurantPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        restaurantName: '',
        description: '',
        cuisineType: '',
        dietaryOptions: '',
        deliveryTime: '30-45 min',
        // Owner details (only if not logged in)
        ownerName: session?.user?.name || '',
        ownerEmail: session?.user?.email || '',
        ownerPhone: '',
        ownerPassword: '',
        ownerConfirmPassword: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!selectedFile) {
            setError('Please upload a high-quality restaurant image.');
            setLoading(false);
            return;
        }

        if (!session && formData.ownerPassword !== formData.ownerConfirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                dataToSend.append(key, value);
            });
            dataToSend.append('image', selectedFile);

            const response = await fetch('/api/restaurants/register', {
                method: 'POST',
                body: dataToSend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/restaurant-dashboard');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (success) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h1>Application Submitted!</h1>
                    <p>Your restaurant application has been submitted successfully.</p>
                    <p>Our team will review it and get back to you soon.</p>
                    <p className={styles.redirectText}>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <h1>Register Your Restaurant</h1>
                <p className={styles.subtitle}>Join Sotobe Eats and reach thousands of customers</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Restaurant Details Section */}
                    <section className={styles.section}>
                        <h2>Restaurant Information</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="restaurantName">Restaurant Name *</label>
                            <input
                                type="text"
                                id="restaurantName"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Soweto Gold"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Tell customers about your restaurant..."
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="cuisineType">Cuisine Type *</label>
                                <select
                                    id="cuisineType"
                                    name="cuisineType"
                                    value={formData.cuisineType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select cuisine type</option>
                                    <option value="Kasi / Traditional">Kasi / Traditional</option>
                                    <option value="Shisa Nyama">Shisa Nyama</option>
                                    <option value="Indian / Durban">Indian / Durban</option>
                                    <option value="Fast Food">Fast Food</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="African">African</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="deliveryTime">Delivery Time</label>
                                <input
                                    type="text"
                                    id="deliveryTime"
                                    name="deliveryTime"
                                    value={formData.deliveryTime}
                                    onChange={handleChange}
                                    placeholder="e.g., 30-45 min"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="dietaryOptions">Dietary Options</label>
                            <input
                                type="text"
                                id="dietaryOptions"
                                name="dietaryOptions"
                                value={formData.dietaryOptions}
                                onChange={handleChange}
                                placeholder="e.g., Halal, Vegetarian, Vegan (comma-separated)"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Restaurant Image *</label>
                            <div
                                className={styles.uploadZone}
                                onClick={() => document.getElementById('imageInput')?.click()}
                            >
                                {previewUrl ? (
                                    <div className={styles.imagePreview}>
                                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                                        <button
                                            type="button"
                                            className={styles.removeImage}
                                            onClick={removeImage}
                                            title="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.uploadIcon}>📸</div>
                                        <div className={styles.uploadText}>Select from Gallery</div>
                                        <div className={styles.uploadSubtext}>High-quality JPG, PNG or WEBP (Max 5MB)</div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    id="imageInput"
                                    accept="image/*"
                                    className={styles.hiddenInput}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Owner Details Section (only if not logged in) */}
                    {!session && (
                        <section className={styles.section}>
                            <h2>Owner Information</h2>
                            <p className={styles.sectionNote}>Create your account to manage your restaurant</p>

                            <div className={styles.formGroup}>
                                <label htmlFor="ownerName">Full Name *</label>
                                <input
                                    type="text"
                                    id="ownerName"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="ownerEmail">Email *</label>
                                    <input
                                        type="email"
                                        id="ownerEmail"
                                        name="ownerEmail"
                                        value={formData.ownerEmail}
                                        onChange={handleChange}
                                        required
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="ownerPhone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="ownerPhone"
                                        name="ownerPhone"
                                        value={formData.ownerPhone}
                                        onChange={handleChange}
                                        placeholder="+27 XX XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="ownerPassword">Password *</label>
                                    <input
                                        type="password"
                                        id="ownerPassword"
                                        name="ownerPassword"
                                        value={formData.ownerPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="ownerConfirmPassword">Confirm Password *</label>
                                    <input
                                        type="password"
                                        id="ownerConfirmPassword"
                                        name="ownerConfirmPassword"
                                        value={formData.ownerConfirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className={styles.btnSecondary}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
