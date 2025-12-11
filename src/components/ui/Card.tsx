import React from 'react';
import styles from './Card.module.css';
import Image from 'next/image';

interface CardProps {
    title: string;
    description?: string;
    imageUrl?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
    onClick?: () => void;
}

export const Card = ({
    title,
    description,
    imageUrl,
    children,
    footer,
    className,
    variant = 'default',
    onClick
}: CardProps) => {
    return (
        <article
            className={`${styles.card} ${variant === 'glass' ? styles.glass : ''} ${className || ''}`}
            onClick={onClick}
        >
            {imageUrl && (
                <div className={styles.imageWrapper}>
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {description && <p className={styles.description}>{description}</p>}
                {children}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </article>
    );
};
