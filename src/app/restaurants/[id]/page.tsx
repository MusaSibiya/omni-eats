
import { Footer } from '@/components/layout/Footer';
import { MenuItemCard } from '@/components/features/MenuItemCard';
import { ReviewForm } from '@/components/features/ReviewForm';
import { FavoriteButton } from '@/components/features/FavoriteButton';
import { MenuWithFilters } from './MenuWithFilters';
import styles from './page.module.css';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { isFavorited } from '@/lib/reviewActions';
import { auth } from '@/auth';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RestaurantDetails({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();

    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            menuItems: true,
            reviews: {
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        },
    });

    if (!restaurant) {
        notFound();
    }

    const isFav = await isFavorited(id);

    // Group menu items by category
    const categoriesMap = new Map<string, typeof restaurant.menuItems>();

    restaurant.menuItems.forEach((item: any) => {
        const category = item.category || 'Other';
        if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
        }
        categoriesMap.get(category)?.push(item);
    });

    const categories = Array.from(categoriesMap.entries()).map(([name, items]) => ({
        name,
        items,
    }));

    // Map seed names to real existing images
    let imageSrc = '/images/restaurant-hero.png';
    const name = restaurant.name;

    if (name === 'The Golden Plate') imageSrc = '/images/hero-salmon.png';
    else if (name === 'Sakura Sushi') imageSrc = '/images/hero-salmon.png';
    else if (name === 'Burger & Co.') imageSrc = '/images/jalapeno-popper.png';
    else if (name === 'Mzansi Flavors') imageSrc = '/images/turkey-bowl.png';
    else if (name === 'Cape Malay Curry House') imageSrc = '/images/tomato-chicken.png';
    else if (name === 'Lekker Bites') imageSrc = '/images/jalapeno-popper.png';
    else if (name === 'Savanna Spice') imageSrc = '/images/corner-salad.png';
    else if (restaurant.imageUrl && !restaurant.imageUrl.includes('restaurant-')) {
        imageSrc = restaurant.imageUrl;
    }

    return (
        <>
            <main className={styles.main}>
                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.heroBackground}>
                        <img src={imageSrc} alt={restaurant.name} className={styles.heroImage} />
                    </div>
                    <div className={styles.heroContent}>
                        <div className={styles.heroHeader}>
                            <div>
                                <h1 className={styles.title}>{restaurant.name}</h1>
                                <div className={styles.meta}>
                                    <span className={styles.rating}>★ {restaurant.rating.toFixed(1)}</span>
                                    <span>•</span>
                                    <span>{restaurant.description}</span>
                                    <span>•</span>
                                    <span>{restaurant.deliveryTime}</span>
                                </div>
                            </div>
                            {session && <FavoriteButton restaurantId={id} initialIsFavorite={isFav} />}
                        </div>
                    </div>
                </div>

                {/* Menu with Filters */}
                <MenuWithFilters
                    menuItems={restaurant.menuItems.map(item => ({
                        ...item,
                        price: Number(item.price),
                    }))}
                />

                {/* Reviews Section */}
                <section id="reviews" className={styles.reviewsSection}>
                    <h2 className={styles.categoryTitle}>Reviews ({restaurant.reviews.length})</h2>

                    {restaurant.reviews.length > 0 && (
                        <div className={styles.reviewsList}>
                            {restaurant.reviews.map((review: any) => (
                                <div key={review.id} className={styles.reviewCard}>
                                    <div className={styles.reviewHeader}>
                                        <div>
                                            <p className={styles.reviewerName}>{review.user.name || 'Anonymous'}</p>
                                            <div className={styles.reviewRating}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className={styles.reviewDate}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {session && <ReviewForm restaurantId={id} />}
                </section>
            </main>
            <Footer />
        </>
    );
}
