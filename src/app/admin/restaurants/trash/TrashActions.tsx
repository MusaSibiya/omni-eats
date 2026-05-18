'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function TrashActions({ restaurantId, restaurantName }: { restaurantId: string, restaurantName: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRestore = async () => {
        if (!confirm(`Restore ${restaurantName}?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/restore`, {
                method: 'POST'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to restore');
            }

            alert('Restaurant restored successfully!');
            router.refresh();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleHardDelete = async () => {
        if (!confirm(`Permanently delete ${restaurantName}? This cannot be undone.`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/hard-delete`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to permanently delete');
            }

            alert('Restaurant permanently deleted.');
            router.refresh();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
                onClick={handleRestore}
                disabled={loading}
                className={styles.primaryBtn}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
                Restore
            </button>
            <button
                onClick={handleHardDelete}
                disabled={loading}
                className={styles.dangerBtn}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
                Delete Forever
            </button>
        </div>
    );
}
