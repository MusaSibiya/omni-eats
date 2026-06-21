'use client';

import { useState, useEffect } from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getDisplayedPages = () => {
        if (totalPages <= 5) {
            return pages;
        }
        if (currentPage <= 3) {
            return isMobile ? [1, 2, '...', totalPages] : [1, 2, 3, '...', totalPages];
        }
        if (currentPage >= totalPages - 2) {
            return isMobile ? [1, '...', totalPages - 1, totalPages] : [1, '...', totalPages - 2, totalPages - 1, totalPages];
        }
        return isMobile ? [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages] : [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.pageBtn} ${styles.prevBtn}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                {isMobile ? '←' : '← Previous'}
            </button>
            
            <div className={styles.pageNumbers}>
                {getDisplayedPages().map((page, index) => (
                    page === '...' ? (
                        <span key={index} className={styles.ellipsis}>...</span>
                    ) : (
                        <button
                            key={page}
                            className={`${styles.pageBtn} ${typeof page === 'number' && currentPage === page ? styles.active : ''}`}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className={`${styles.pageBtn} ${styles.nextBtn}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                {isMobile ? '→' : 'Next →'}
            </button>
        </div>
    );
}
