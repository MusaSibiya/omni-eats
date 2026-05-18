'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface Restaurant {
    id: string;
    name: string;
    rating: number;
    deliveryTime: string | null;
    imageUrl: string | null;
    description: string | null;
    cuisineType: string | null;
    menuItems: Array<{ price: number }> | null;
}

interface RestaurantListProps {
    restaurants: Restaurant[];
}

const getDynamicDetails = (restaurant: Restaurant) => {
    // Determine price category dynamically from menu items
    let priceCat = 'RR';
    if (restaurant.menuItems && restaurant.menuItems.length > 0) {
        const avgPrice = restaurant.menuItems.reduce((acc, item) => acc + Number(item.price), 0) / restaurant.menuItems.length;
        if (avgPrice < 80) priceCat = 'R';
        else if (avgPrice > 200) priceCat = 'RRR';
        else priceCat = 'RR';
    }

    // Determine tags from cuisine type
    const tags = restaurant.cuisineType ? [restaurant.cuisineType] : ['Local'];
    return { price: priceCat, tags };
};

export function RestaurantList({ restaurants }: RestaurantListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={styles.clearButton}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className={styles.searchResults}>
                        {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
                    </p>
                )}
            </div>

            {filteredRestaurants.length === 0 ? (
                <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>🔍</div>
                    <h3 className={styles.noResultsTitle}>No restaurants found</h3>
                    <p className={styles.noResultsText}>
                        Try adjusting your search terms
                    </p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredRestaurants.map((restaurant) => {
                        const { price, tags } = getDynamicDetails(restaurant);

                        // Map seed names to real existing images in public/images
                        let imageSrc = '/images/restaurant-hero.png';
                        const name = restaurant.name;

                        if (name === 'The Golden Plate') imageSrc = '/images/hero-salmon.png';
                        else if (name === 'Sakura Sushi') imageSrc = '/images/hero-salmon.png'; // Fallback
                        else if (name === 'Burger & Co.') imageSrc = '/images/jalapeno-popper.png';
                        else if (name === 'Mzansi Flavors') imageSrc = '/images/turkey-bowl.png';
                        else if (name === 'Cape Malay Curry House') imageSrc = '/images/tomato-chicken.png';
                        else if (name === 'Lekker Bites') imageSrc = '/images/jalapeno-popper.png';
                        else if (name === 'Savanna Spice') imageSrc = '/images/corner-salad.png';
                        else if (restaurant.imageUrl && !restaurant.imageUrl.includes('restaurant-')) {
                            // Use DB image if provided and not one of the broken seed ones (restaurant-1.jpg etc)
                            imageSrc = restaurant.imageUrl;
                        }

                        return (
                            <Link href={`/restaurants/${restaurant.id}`} key={restaurant.id} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={styles.cardImageWrapper}>
                                    <Image
                                        src={imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('http') ? imageSrc : (imageSrc && typeof imageSrc === 'string' && imageSrc.startsWith('/') ? imageSrc : `/${imageSrc || 'images/restaurant-hero.png'}`)}
                                        alt={restaurant.name || 'Restaurant'}
                                        fill
                                        className={styles.cardImage}
                                        quality={95}
                                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1399px) 33vw, (max-width: 1799px) 25vw, 20vw"
                                    />
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.restaurantName}>{restaurant.name}</h3>
                                        <div className={styles.rating}>
                                            <span className={styles.star}>★</span>
                                            {restaurant.rating}
                                        </div>
                                    </div>
                                    <div className={styles.tags}>
                                        {tags.map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                    <div className={styles.cardDetails}>
                                        <span>{restaurant.deliveryTime || '30-45 min'}</span>
                                        <span>•</span>
                                        <span>{price}</span>
                                        <span>•</span>
                                        <span>Standard Delivery</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}
