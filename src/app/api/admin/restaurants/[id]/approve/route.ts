import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only admins can approve restaurants
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id: restaurantId } = await params;

        // Update restaurant status to APPROVED
        const restaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                status: 'APPROVED',
                isOpen: true // Automatically open when approved
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

        console.log(`Restaurant ${restaurant.name} approved by admin ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Restaurant approved successfully',
            restaurant
        });

    } catch (error: any) {
        console.error('Error approving restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to approve restaurant', details: error.message },
            { status: 500 }
        );
    }
}
