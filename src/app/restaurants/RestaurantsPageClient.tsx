'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import styles from './page.module.css';
import Image from 'next/image';
import { RestaurantList } from './RestaurantList';
import { Pagination } from '@/components/ui/Pagination';

const HERO_IMAGES = [
    '/images/restaurant-hero.png',
    '/images/hero-salmon.png',
    '/images/tomato-chicken.png',
    '/images/turkey-bowl.png',
    '/images/jalapeno-popper.png',
];

interface RestaurantsPageProps {
    allRestaurants: any[];
    itemsPerPage: number;
}

export default function RestaurantsPageClient({ allRestaurants, itemsPerPage }: RestaurantsPageProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Filter restaurants based on search query
    const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

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
                            quality={100}
                            sizes="100vw"
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
                <RestaurantList 
                    restaurants={paginatedRestaurants} 
                    searchQuery={searchQuery} 
                    onSearchChange={handleSearchChange} 
                    totalPages={totalPages} 
                    currentPage={currentPage} 
                    onPageChange={handlePageChange} 
                />
            </div>

            <Footer />
        </main>
    );
}
