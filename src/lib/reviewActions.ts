'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Create a review
export async function createReview(restaurantId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    if (rating < 1 || rating > 5) {
        return { error: 'Rating must be between 1 and 5' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // Check if user has already reviewed this restaurant
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                restaurantId,
            },
        });

        if (existingReview) {
            return { error: 'You have already reviewed this restaurant' };
        }

        // Create review
        await prisma.review.create({
            data: {
                userId: user.id,
                restaurantId,
                rating,
                comment,
            },
        });

        // Update restaurant average rating
        const reviews = await prisma.review.findMany({
            where: { restaurantId },
        });

        const averageRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { rating: averageRating },
        });

        revalidatePath(`/restaurants/${restaurantId}`);
        return { success: true };
    } catch (error) {
        console.error('Review creation error:', error);
        return { error: 'Failed to create review' };
    }
}

// Toggle favorite
export async function toggleFavorite(restaurantId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // Check if already favorited
        const existing = await prisma.favorite.findFirst({
            where: {
                userId: user.id,
                restaurantId,
            },
        });

        if (existing) {
            // Remove favorite
            await prisma.favorite.delete({
                where: { id: existing.id },
            });
            revalidatePath(`/restaurants/${restaurantId}`);
            revalidatePath('/favorites');
            return { success: true, isFavorite: false };
        } else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    restaurantId,
                },
            });
            revalidatePath(`/restaurants/${restaurantId}`);
            revalidatePath('/favorites');
            return { success: true, isFavorite: true };
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return { error: 'Failed to toggle favorite' };
    }
}

// Get user's favorites
export async function getUserFavorites() {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return [];
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: {
                restaurant: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return favorites;
    } catch (error) {
        console.error('Get favorites error:', error);
        return [];
    }
}

// Check if restaurant is favorited
export async function isFavorited(restaurantId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return false;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return false;
        }

        const favorite = await prisma.favorite.findFirst({
            where: {
                userId: user.id,
                restaurantId,
            },
        });

        return !!favorite;
    } catch (error) {
        return false;
    }
}
