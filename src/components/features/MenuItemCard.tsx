
'use client';

import React, { useState } from 'react';
import styles from './MenuItemCard.module.css';
import { useCart } from '@/contexts/CartContext';

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number | string; // Handle Prisma Decimal serialized or number
    imageUrl: string | null;
    category: string;
    restaurantId: string;
}

interface MenuItemCardProps {
    item: MenuItem;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            restaurantId: item.restaurantId,
            description: item.description || undefined,
            imageUrl: item.imageUrl || undefined
        });

        // Show feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <article className={styles.itemCard} onClick={handleAddToCart}>
            <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemDesc}>
                    {item.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                    <span className={styles.itemPrice}>R{Number(item.price).toFixed(2)}</span>
                    <button
                        className={`${styles.addButton} ${isAdded ? styles.added : ''}`}
                        onClick={handleAddToCart}
                    >
                        {isAdded ? (
                            <>
                                <span style={{ marginRight: '6px' }}>✓</span>
                                Added!
                            </>
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>
            </div>
            {item.imageUrl && (
                <div
                    className={styles.itemImage}
                    style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}
        </article>
    );
};
