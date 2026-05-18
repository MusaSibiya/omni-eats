import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only admins can permanently delete restaurants
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id: restaurantId } = await params;

        // 1. Get all menu items for this restaurant
        const menuItems = await prisma.menuItem.findMany({
            where: { restaurantId },
            select: { id: true }
        });
        const menuItemIds = menuItems.map(item => item.id);

        // 2. Delete all related data first to avoid foreign key constraint errors
        if (menuItemIds.length > 0) {
            await prisma.orderItem.deleteMany({
                where: { menuItemId: { in: menuItemIds } }
            });
        }

        await prisma.menuItem.deleteMany({ where: { restaurantId } });
        await prisma.favorite.deleteMany({ where: { restaurantId } });
        await prisma.review.deleteMany({ where: { restaurantId } });

        // 3. Now delete the restaurant
        await prisma.restaurant.delete({ where: { id: restaurantId } });

        console.log(`Restaurant ${restaurantId} permanently deleted by admin ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant permanently deleted'
        });

    } catch (error: any) {
        console.error('Error hard deleting restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to permanently delete restaurant', details: error.message },
            { status: 500 }
        );
    }
}
