import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    // 1. Get all restaurants dynamic routes
    const restaurants = await prisma.restaurant.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
    });

    const restaurantUrls = restaurants.map((restaurant) => ({
        url: `${baseUrl}/restaurants/${restaurant.id}`,
        lastModified: restaurant.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 2. Define static routes
    const routes = [
        '',
        '/restaurants',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    return [...routes, ...restaurantUrls];
}
