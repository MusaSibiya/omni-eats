'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

interface MenuItem {
    id: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
}

interface HomePageProps {
    featuredMeals: MenuItem[];
}

const filterCategories = ['All', 'Low-Carb', 'Keto-Calorie', 'Meat-Based', 'Family'];

// Category mapping based on menu item categories
const getCategoryTags = (category: string | null): string[] => {
    const tags = ['All'];
    const cat = category?.toLowerCase() || '';

    if (cat.includes('starters') || cat.includes('salad') || cat.includes('soup')) {
        tags.push('Low-Carb', 'Keto-Calorie');
    }

    if (cat.includes('main') || cat.includes('burger') || cat.includes('steak') || cat.includes('chicken') || cat.includes('meat')) {
        tags.push('Meat-Based', 'Keto-Calorie', 'Family');
    }

    if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('cake')) {
        tags.push('Family');
    }

    if (cat.includes('side') || cat.includes('fries') || cat.includes('rice')) {
        tags.push('Low-Carb', 'Family');
    }

    if (cat.includes('drink') || cat.includes('beverage')) {
        tags.push('Keto-Calorie');
    }

    // Fallback: If no specific tags found, add to Family so it at least appears somewhere
    if (tags.length === 1) {
        tags.push('Family');
    }

    return tags;
};

export default function HomePage({ featuredMeals }: HomePageProps) {
    const [activeFilter, setActiveFilter] = useState('All');

    // Map meals with category tags
    const mealsWithTags = featuredMeals.map(meal => ({
        ...meal,
        tags: getCategoryTags(meal.category)
    }));

    const filteredMeals = mealsWithTags.filter(meal =>
        meal.tags.includes(activeFilter)
    );

    return (
        <>
            {/* Hero Section */}
            <section className={styles.hero}>
                {/* Brand Microcopy */}
                <div className={styles.discoveryCopyright}>
                    <span>EST. 2025</span>
                    <span className={styles.separator}>•</span>
                    <span>ELEVATING DAILY DINING</span>
                </div>

                {/* Floating Corner Plate */}
                <div className={styles.cornerPlate}>
                    <Image
                        src="/images/corner-salad_nobackground.png"
                        alt="Fresh salad bowl"
                        width={400}
                        height={400}
                        priority
                    />
                </div>

                <div className={styles.heroContainer}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            A Chef In Every
                            <br />
                            Tasty Meal Box
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Get pre-portioned ingredients for Omni Meal Kits
                            <br />
                            best recipes delivered direct to your door!
                        </p>
                        <div className={styles.heroButtons}>
                            <Link href="/restaurants">
                                <button className={styles.btnPrimary}>Select Program</button>
                            </Link>
                            <Link href="/restaurants">
                                <button className={styles.btnSecondary}>View Menu</button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <Image
                            src="/images/hero-salmon_nobackground.png"
                            alt="Gourmet salmon salad"
                            width={600}
                            height={600}
                            priority
                            className={styles.foodImage}
                        />
                    </div>
                </div>

                {/* Delivery Info Card */}
                <div className={styles.deliveryCard}>
                    <div className={styles.deliveryCardImage}>
                        <Image
                            src="/images/hero-salmon.png"
                            alt="Fresh meal"
                            width={200}
                            height={150}
                        />
                    </div>
                    <div className={styles.deliveryCardContent}>
                        <h3>We Deliver Anywhere in the Tri-State Area</h3>
                        <p>Each freshly-made is perfectly sized for 1 person to enjoy at 1 sitting. Our fully-prepared meals are delivered fresh.</p>
                        <div className={styles.deliveryCardFooter}>
                            <span className={styles.chefLabel}>Original Idea by</span>
                            <button className={styles.btnOrder}>Order Now</button>
                            <button className={styles.btnMenu}>View Menu</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Omni Eats Section */}
            <section className={styles.whySection}>
                <div className={styles.whyContainer}>
                    <h2 className={styles.sectionTitle}>Why Omni Eats Meals</h2>
                    <div className={styles.whyGrid}>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3>Locally Sourced</h3>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 7v10M8 7h4a3.5 3.5 0 0 1 0 7h-4M12 14l3 3" />
                                </svg>
                            </div>
                            <h3>Fresh and Affordable</h3>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h3>No commitment</h3>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                            <h3>No skipped-boxes!</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Watch It Works Section */}
            <section className={styles.watchSection}>
                {/* Decorative Elements */}
                <div className={styles.decorLeft} style={{ zIndex: 10 }}>
                    <img
                        src="/images/pepper_nobackground.png"
                        alt="Fresh Chili"
                        width={140}
                        height={140}
                        className={styles.floatingDecor}
                        style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
                    />
                </div>



                <div className={styles.decorBottomLeft} style={{ zIndex: 10 }}></div>

                <h2 className={styles.sectionTitle}>Watch It Works</h2>
                <div className={styles.stepsGrid}>
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                                <rect x="25" y="25" width="50" height="70" rx="4" fill="var(--bg-tertiary)" stroke="var(--accent-primary)" strokeWidth="2" />
                                <circle cx="50" cy="85" r="3" fill="var(--accent-primary)" />
                                <path d="M35 15 L35 35 M65 15 L65 35" stroke="var(--accent-primary)" strokeWidth="2" />
                            </svg>
                        </div>
                        <h3>Choose Your Meals</h3>
                        <p>Our menu rotates weekly and features a variety of cuisines.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                                <path d="M20 60 L80 60 L70 90 L30 90 Z" fill="var(--bg-tertiary)" stroke="var(--accent-primary)" strokeWidth="2" />
                                <circle cx="35" cy="50" r="10" fill="var(--accent-primary)" opacity="0.8" />
                                <circle cx="65" cy="40" r="12" fill="var(--accent-primary)" />
                                <path d="M50 20 L50 40" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="4 4" />
                            </svg>
                        </div>
                        <h3>We Deliver It To You</h3>
                        <p>Choose your dates for delivery and we'll handle the rest.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <div className={styles.stepIcon}>
                            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                                <circle cx="50" cy="50" r="35" stroke="var(--accent-primary)" strokeWidth="2" fill="var(--bg-tertiary)" />
                                <path d="M35 50 L45 60 L70 35" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Cook & Enjoy</h3>
                        <p>Eat your freshly-cooked meal and enjoy every bite!</p>
                    </div>
                </div>
            </section>

            {/* Favorite Meals Section */}
            <section className={styles.mealsSection}>
                {/* Decorative Elements */}
                <div className={styles.decorRight} style={{ zIndex: 10, top: '10%', right: '5%' }}>
                    <img
                        src="/images/tomato_real_nobackground.png"
                        alt="Fresh Tomato"
                        width={150}
                        height={150}
                        className={styles.floatingDecor}
                        style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
                    />
                </div>

                <h2 className={styles.sectionTitle}>Favorite Meals</h2>
                <div className={styles.mealFilters}>
                    {filterCategories.map(category => (
                        <button
                            key={category}
                            className={`${styles.filterBtn} ${activeFilter === category ? styles.active : ''}`}
                            onClick={() => setActiveFilter(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className={styles.mealsGrid}>
                    {filteredMeals
                        .map(meal => (
                            <div key={meal.id} className={styles.mealCard}>
                                <div className={styles.mealImageWrapper}>
                                    <Image
                                        src={meal.imageUrl?.startsWith('http') ? meal.imageUrl : (meal.imageUrl || "/images/hero-salmon.png")}
                                        alt={meal.name}
                                        width={400}
                                        height={400}
                                        className={styles.mealImage}
                                    />
                                </div>
                                <h3>{meal.name}</h3>
                            </div>
                        ))}
                </div>
                {filteredMeals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <p>No featured meals found. Check back soon for our latest chef creations!</p>
                    </div>
                )}
                <div className={styles.viewAllBtn}>
                    <Link href="/restaurants">
                        <button className={styles.btnPrimary}>View Full Menu</button>
                    </Link>
                </div>
            </section>
        </>
    );
}
