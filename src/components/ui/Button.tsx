import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

        // Combine classes based on props
        const buttonClasses = [
            styles.button,
            styles[variant],
            styles[size],
            isLoading ? styles.loading : '',
            className
        ].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                className={buttonClasses}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <span className={styles.spinner} aria-label="Loading" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
