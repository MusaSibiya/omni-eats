'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { updateRestaurantProfile } from '@/lib/dashboardActions';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import styles from '../../admin/admin.module.css';
import registerStyles from '../../register-restaurant/page.module.css';
import formStyles from '../dashboard-forms.module.css';

interface ProfileFormProps {
    restaurant: {
        id: string;
        name: string;
        description: string | null;
        cuisineType: string | null;
        deliveryTime: string | null;
        deliveryAvailable: boolean;
        address: string | null;
        imageUrl: string | null;
        profileChangeLog: string | null;
        rating: number;
    };
}

export default function ProfileForm({ restaurant }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // UI States
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(restaurant.imageUrl);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Crop States
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [formData, setFormData] = useState({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisineType: restaurant.cuisineType || '',
        deliveryTime: restaurant.deliveryTime || '',
        deliveryAvailable: restaurant.deliveryAvailable,
        address: restaurant.address || ''
    });

    // Calculate changes remaining
    const now = Date.now();
    const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000);
    let changeLog: number[] = [];
    try {
        changeLog = restaurant.profileChangeLog ? JSON.parse(restaurant.profileChangeLog) : [];
    } catch (e) {
        changeLog = [];
    }
    const recentChanges = changeLog.filter(ts => ts > twoMonthsAgo);
    const changesRemaining = 3 - recentChanges.length;

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsEditingImage(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (changesRemaining <= 0) {
            setError('Update limit reached. You can only change your profile 3 times every 2 months.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    data.append(key, String(value));
                }
            });
            if (selectedFile) {
                data.append('image', selectedFile);
            }

            const result = await updateRestaurantProfile(restaurant.id, data);

            if (result.success) {
                setSuccess('Profile updated successfully!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className={formStyles.form} style={{ maxWidth: '100%' }}>
            {/* Interactive Header Content */}
            <div className={styles.premiumHeader + ' ' + formStyles.profileHeader} style={{ position: 'relative', borderRadius: '24px', marginBottom: '40px', padding: '32px 40px' }}>
                <div className={styles.headerContent}>
                    <div className={styles.headerText}>
                        <h1 className={styles.dashboardTitle}>Restaurant Profile</h1>
                        <p className={styles.dashboardSubtitle}>
                            <span className={styles.liveIndicator}></span>
                            Manage your restaurant information
                        </p>
                    </div>
                </div>

                <div className={formStyles.profilePicWrapper}>
                    <img
                        src={previewUrl || '/default-restaurant.png'}
                        alt={restaurant.name}
                        className={styles.headerProfilePic}
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById('imageInput')?.click()}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            marginTop: '4px'
                        }}
                    >
                        📸 Update Picture
                    </button>
                    <input
                        type="file"
                        id="imageInput"
                        accept="image/*"
                        className={registerStyles.hiddenInput}
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className={formStyles.form}>
                {error && <div className={registerStyles.error}>{error}</div>}
                {success && (
                    <div style={{
                        background: 'rgba(56, 178, 172, 0.1)',
                        color: '#38b2ac',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(56, 178, 172, 0.2)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span>✅</span> {success}
                    </div>
                )}

                <div className={formStyles.quotaBanner}>
                    <div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>Update Quota</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Next reset in 60 days</div>
                    </div>
                    <span className={formStyles.quotaBadge + (changesRemaining <= 0 ? ' ' + formStyles.limitReached : '')}>
                        {changesRemaining} / 3 Changes Left
                    </span>
                </div>

                <div className={formStyles.formGroup}>
                    <label className={formStyles.formLabel}>
                        Restaurant Details
                        <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>* Required</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Restaurant Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={formStyles.input}
                    />
                </div>

                <div className={formStyles.formGroup}>
                    <textarea
                        name="description"
                        placeholder="Tell us about your restaurant..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className={formStyles.textarea}
                    />
                </div>

                <div className={formStyles.formGroup}>
                    <label className={formStyles.formLabel}>Physical Address</label>
                    <AddressAutocomplete
                        value={formData.address}
                        onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                        placeholder="e.g. 254 Fox Street, Johannesburg"
                    />
                </div>

                <div className={formStyles.grid}>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.formLabel} style={{ opacity: 0.6, fontSize: '0.8rem' }}>Cuisine Style</label>
                        <input
                            type="text"
                            name="cuisineType"
                            placeholder="e.g. Italian, Fast Food"
                            value={formData.cuisineType}
                            onChange={handleChange}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.formLabel} style={{ opacity: 0.6, fontSize: '0.8rem' }}>Quick Delivery Time</label>
                        <input
                            type="text"
                            name="deliveryTime"
                            placeholder="e.g. 20-30 mins"
                            value={formData.deliveryTime}
                            onChange={handleChange}
                            className={formStyles.input}
                        />
                    </div>
                </div>

                <div className={formStyles.formGroup} style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="deliveryAvailable"
                            checked={formData.deliveryAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, deliveryAvailable: e.target.checked }))}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                        />
                        <div>
                            <span style={{ fontWeight: 600, color: 'white', display: 'block' }}>Enable Delivery Service</span>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Turn this off if you only want to offer self-collection/pickup.</span>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={loading || changesRemaining <= 0}
                    style={{ marginTop: '2.5rem', width: '100%', paddingTop: '1.25rem', paddingBottom: '1.25rem', fontSize: '1.1rem' }}
                >
                    {loading ? 'Saving Changes...' : changesRemaining <= 0 ? 'Monthly Limit Reached' : 'Apply Changes'}
                </button>
            </form>

            {/* Cropping Modal */}
            {isEditingImage && previewUrl && (
                <div className={styles.cropModal}>
                    <h2 style={{ color: 'white', marginBottom: '20px', fontWeight: 800 }}>Position Your Profile Picture</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>Drag to position and use the slider to zoom</p>

                    <div className={styles.cropContainer}>
                        <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>

                    <div className={styles.cropControls}>
                        <div className={styles.sliderWrapper}>
                            <label>Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className={styles.slider}
                            />
                        </div>

                        <div className={styles.cropActions}>
                            <button
                                className={styles.primaryBtn}
                                style={{ flex: 1 }}
                                onClick={() => setIsEditingImage(false)}
                            >
                                Set Position
                            </button>
                            <button
                                className={styles.dangerBtn}
                                style={{ padding: '0 24px', borderRadius: '12px' }}
                                onClick={() => {
                                    setIsEditingImage(false);
                                    setPreviewUrl(restaurant.imageUrl);
                                    setSelectedFile(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
