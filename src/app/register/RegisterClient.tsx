'use client';

import { useActionState } from 'react';
import { register } from '@/lib/actions';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const slides = [
    {
        title: "Join the Future of Dining",
        text: "Create an account to track your orders, save your favorite meals, and get exclusive access to premium restaurants."
    },
    {
        title: "Curated Culinary Excellence",
        text: "Access exclusive menus from top-rated chefs and gourmet restaurants, typically reserved for dine-in only."
    },
    {
        title: "Lightning Fast Premium Delivery",
        text: "Real-time tracking and white-glove delivery service ensures your meal arrives exactly as the chef intended."
    }
];

export default function RegisterClient() {
    const [errorMessage, dispatch, isPending] = useActionState(register, undefined);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <main className={styles.container}>
            {/* Restaurant Registration Link - Top Right */}
            <div className={styles.restaurantLinkTop}>
                <p>Are you a restaurant owner?</p>
                <Link href="/register-restaurant" className={styles.restaurantButton}>
                    🍽️ Register Your Restaurant
                </Link>
            </div>

            {/* Background Decorative Elements */}
            <div className={styles.decorWrapper}>
                <div className={styles.decorItem} data-item="burger">
                    <Image
                        src="/images/burger_floating-nobg.png"
                        alt="Gourmet Burger"
                        width={400}
                        height={400}
                        priority
                    />
                </div>
                <div className={styles.decorItem} data-item="pizza">
                    <Image
                        src="/images/pizza_floating-nobg.png"
                        alt="Delicious Pizza"
                        width={250}
                        height={250}
                    />
                </div>
                <div className={styles.decorItem} data-item="taco">
                    <Image
                        src="/images/taco_floating-nobg.png"
                        alt="Fresh Taco"
                        width={200}
                        height={200}
                    />
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.formSection}>
                    <div className={styles.mobileLogo}>
                        <div className={styles.logo}>
                            SOTOBE <span>MEALS</span>
                        </div>
                    </div>

                    <h2 className={styles.title}>Create an Account</h2>
                    <p className={styles.subtitle}>Join thousands of food lovers today</p>

                    <form action={dispatch} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="name">
                                Full Name
                            </label>
                            <input
                                className={styles.input}
                                id="name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className={styles.input}
                                id="email"
                                type="email"
                                name="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="password">
                                Password
                            </label>
                            <input
                                className={styles.input}
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                className={styles.input}
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <div className={styles.errorContainer} aria-live="polite" aria-atomic="true">
                            {errorMessage && (
                                <p className={styles.errorMessage}>{errorMessage}</p>
                            )}
                        </div>
                    </form>

                    <div className={styles.footer}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.footerLink}>
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Right Side - Branding Gradient */}
                <div className={styles.brandingSection}>
                    <div className={styles.brandingContent}>
                        <div className={styles.brandingLogo}>
                            SOTOBE <span>EATS</span>
                        </div>

                        <div className={styles.carouselContainer}>
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`${styles.slide} ${index === currentSlide ? styles.activeSlide : ''}`}
                                >
                                    <h2 className={styles.brandingTitle}>{slide.title}</h2>
                                    <p className={styles.brandingText}>{slide.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className={styles.brandingDots}>
                            {slides.map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                ></span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
