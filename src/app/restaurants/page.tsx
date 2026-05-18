import { prisma } from '@/lib/prisma';
import RestaurantsPageClient from './RestaurantsPageClient';

export default async function RestaurantsPage() {
    const restaurants = await prisma.restaurant.findMany({
        where: {
            deletedAt: null,
            status: 'APPROVED'
        },
        include: {
            menuItems: {
                select: { price: true }
            }
        }
    });

    return <RestaurantsPageClient restaurants={restaurants} />;
}
