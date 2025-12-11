'use client';

import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/lib/reviewActions';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
    restaurantId: string;
    initialIsFavorite: boolean;
}

export function FavoriteButton({ restaurantId, initialIsFavorite }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleFavorite(restaurantId);
            if (result.success) {
                setIsFavorite(result.isFavorite!);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}
