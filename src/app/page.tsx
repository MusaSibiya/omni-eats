import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/prisma';
import HomePage from './HomePage';
import styles from './page.module.css';

import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  let featuredMeals;

  if (session?.user?.id) {
    // 1. Get user's favorite restaurants
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { restaurantId: true },
    });

    const favoriteRestaurantIds = favorites.map(f => f.restaurantId);

    if (favoriteRestaurantIds.length > 0) {
      // 2. Get meals specifically from those restaurants
      featuredMeals = await prisma.menuItem.findMany({
        where: {
          restaurantId: { in: favoriteRestaurantIds },
          restaurant: {
            deletedAt: null,
            status: 'APPROVED'
          }
        },
        take: 3,
        select: {
          id: true,
          name: true,
          category: true,
          imageUrl: true,
        },
      });
    }
  }

  // 3. Fallback: If no user, no favorites, or not enough items, fetch general featured items
  if (!featuredMeals || featuredMeals.length === 0) {
    featuredMeals = await prisma.menuItem.findMany({
      where: {
        restaurant: {
          deletedAt: null,
          status: 'APPROVED'
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
      },
    });
  }

  return (
    <main className={styles.main}>
      <HomePage featuredMeals={featuredMeals} />
      <Footer />
    </main>
  );
}
