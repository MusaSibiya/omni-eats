import { prisma } from '@/lib/prisma';
import RestaurantsPageClient from './RestaurantsPageClient';
import { Suspense } from 'react';

const ITEMS_PER_PAGE = 4;

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
        },
    });

    const serializedRestaurants = JSON.parse(JSON.stringify(restaurants));

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RestaurantsPageClient 
                allRestaurants={serializedRestaurants} 
                itemsPerPage={ITEMS_PER_PAGE} 
            />
        </Suspense>
    );
}
