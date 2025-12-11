'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import styles from './page.module.css';
import Image from 'next/image';
import { RestaurantList } from './RestaurantList';

const HERO_IMAGES = [
    '/images/restaurant-hero.png',
    '/images/hero-salmon.png',
    '/images/tomato-chicken.png',
    '/images/turkey-bowl.png',
    '/images/jalapeno-popper.png',
];

interface RestaurantsPageProps {
    restaurants: any[];
}

export default function RestaurantsPageClient({ restaurants }: RestaurantsPageProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <main className={styles.main}>

            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    {HERO_IMAGES.map((image, index) => (
                        <Image
                            key={image}
                            src={image}
                            alt="Restaurant Ambience"
                            fill
                            className={`${styles.heroImage} ${index === currentSlide ? styles.active : ''}`}
                            priority={index === 0}
                        />
                    ))}

                    {/* Slide indicators */}
                    <div className={styles.slideIndicators}>
                        {HERO_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.indicator} ${index === currentSlide ? styles.indicatorActive : ''}`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>All Restaurants</h1>
                    <p className={styles.subtitle}>Discover the finest culinary experiences near you. From local favorites you dont want to miss out, order now!!!.</p>
                </div>
            </section>

            <div className={styles.container}>
                <RestaurantList restaurants={restaurants} />
            </div>

            <Footer />
        </main>
    );
}
