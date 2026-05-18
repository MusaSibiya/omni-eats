'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

interface ApprovalButtonsProps {
    restaurantId: string;
    restaurantName: string;
}

export function ApprovalButtons({ restaurantId, restaurantName }: ApprovalButtonsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        if (!confirm(`Approve ${restaurantName}?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/approve`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to approve');
            }

            alert('Restaurant approved successfully!');
            router.refresh();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm(`Reject ${restaurantName}? This action cannot be undone.`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/reject`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reject');
            }

            alert('Restaurant application rejected.');
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
                onClick={handleApprove}
                disabled={loading}
                className={styles.primaryBtn}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
                ✓ Approve
            </button>
            <button
                onClick={handleReject}
                disabled={loading}
                className={styles.dangerBtn}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
                ✗ Reject
            </button>
        </div>
    );
}
