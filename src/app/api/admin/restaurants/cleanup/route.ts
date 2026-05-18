import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        // Find restaurants deleted more than 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const restaurantsToClean = await prisma.restaurant.findMany({
            where: {
                deletedAt: {
                    lt: thirtyDaysAgo
                }
            },
            select: { id: true }
        });

        const restaurantIds = restaurantsToClean.map(r => r.id);

        if (restaurantIds.length === 0) {
            return NextResponse.json({ message: 'No restaurants to clean up', count: 0 });
        }

        // We must perform cascading deletes for each restaurant
        for (const id of restaurantIds) {
            // 1. Get menu items to delete their order items first
            const menuItems = await prisma.menuItem.findMany({
                where: { restaurantId: id },
                select: { id: true }
            });
            const menuItemIds = menuItems.map(item => item.id);

            if (menuItemIds.length > 0) {
                await prisma.orderItem.deleteMany({
                    where: { menuItemId: { in: menuItemIds } }
                });
            }

            // 2. Delete restaurant dependencies
            await prisma.menuItem.deleteMany({ where: { restaurantId: id } });
            await prisma.favorite.deleteMany({ where: { restaurantId: id } });
            await prisma.review.deleteMany({ where: { restaurantId: id } });

            // 3. Delete restaurant
            await prisma.restaurant.delete({ where: { id } });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully cleaned up ${restaurantIds.length} deleted restaurants`,
            count: restaurantIds.length
        });
    } catch (error: any) {
        console.error('Error during cleanup:', error);
        return NextResponse.json(
            { error: 'Failed to clean up deleted restaurants', details: error.message },
            { status: 500 }
        );
    }
}
