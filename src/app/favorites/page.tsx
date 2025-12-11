import { auth } from '@/auth';
import { getUserFavorites } from '@/lib/reviewActions';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import styles from './favorites.module.css';
import { redirect } from 'next/navigation';

export default async function FavoritesPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/login');
    }

    const favorites = await getUserFavorites();

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>My Favorites</h1>

                    {favorites.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>❤️</div>
                            <h2 className={styles.emptyTitle}>No favorites yet</h2>
                            <p className={styles.emptyText}>
                                Start adding your favorite restaurants to quickly access them later!
                            </p>
                            <Link href="/restaurants">
                                <button className={styles.primaryBtn}>Browse Restaurants</button>
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {favorites.map(({ restaurant }: any) => (
                                <Link
                                    key={restaurant.id}
                                    href={`/restaurants/${restaurant.id}`}
                                    className={styles.card}
                                >
                                    <div className={styles.cardImageWrapper}>
                                        <Image
                                            src={restaurant.imageUrl || '/images/restaurant-hero.png'}
                                            alt={restaurant.name}
                                            fill
                                            className={styles.cardImage}
                                        />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.restaurantName}>{restaurant.name}</h3>
                                            <div className={styles.rating}>
                                                <span className={styles.star}>★</span>
                                                {restaurant.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <p className={styles.description}>{restaurant.description}</p>
                                        <div className={styles.cardDetails}>
                                            <span>{restaurant.deliveryTime || '30-45 min'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
