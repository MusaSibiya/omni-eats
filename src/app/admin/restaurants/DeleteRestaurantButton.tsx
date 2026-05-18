'use client';

import { useState } from 'react';
import { deleteRestaurant } from '@/lib/adminActions';
import styles from '../admin.module.css';

interface DeleteRestaurantButtonProps {
    restaurantId: string;
    restaurantName: string;
}

export default function DeleteRestaurantButton({ restaurantId, restaurantName }: DeleteRestaurantButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteRestaurant(restaurantId);
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
            alert('Failed to delete restaurant. Please try again.');
            setIsDeleting(false);
            setIsConfirming(false);
        }
    };

    if (isConfirming) {
        return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#ff4d4f', fontWeight: '600' }}>Confirm?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={styles.dangerBtn}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#ff4d4f', color: 'white' }}
                >
                    {isDeleting ? '...' : 'Yes'}
                </button>
                <button
                    onClick={() => setIsConfirming(false)}
                    disabled={isDeleting}
                    className={styles.primaryBtn}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #ddd', color: '#666', boxShadow: 'none' }}
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className={styles.dangerBtn}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
            Delete
        </button>
    );
}
