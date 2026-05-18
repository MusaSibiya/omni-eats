import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only admins can restore restaurants
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id: restaurantId } = await params;

        // Restore the restaurant by clearing deletedAt
        const restaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                deletedAt: null
            }
        });

        console.log(`Restaurant ${restaurant.name} restored by admin ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant restored successfully',
            restaurant
        });

    } catch (error: any) {
        console.error('Error restoring restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to restore restaurant', details: error.message },
            { status: 500 }
        );
    }
}
