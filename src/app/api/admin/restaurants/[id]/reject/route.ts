import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only admins can reject restaurants
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id: restaurantId } = await params;

        // Update restaurant status to REJECTED and set deletedAt for soft delete
        const restaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                status: 'REJECTED',
                isOpen: false,
                deletedAt: new Date()
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        console.log(`Restaurant ${restaurant.name} rejected by admin ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant application rejected',
            restaurant
        });

    } catch (error: any) {
        console.error('Error rejecting restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to reject restaurant', details: error.message },
            { status: 500 }
        );
    }
}
