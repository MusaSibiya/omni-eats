import { prisma } from '@/lib/prisma';
import RestaurantsPageClient from './RestaurantsPageClient';

export default async function RestaurantsPage() {
    const restaurants = await prisma.restaurant.findMany();

    return <RestaurantsPageClient restaurants={restaurants} />;
}
