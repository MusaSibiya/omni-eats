'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './BackButton.module.css';

interface BackButtonProps {
    className?: string;
    label?: string;
    style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({ className, label = 'Back', style }) => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`${styles.backButton} ${className || ''}`}
            aria-label="Go back"
            style={style}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{label}</span>
        </button>
    );
};
