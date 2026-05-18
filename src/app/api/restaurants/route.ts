import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: {
                deletedAt: null,
                status: 'APPROVED'
            },
            include: {
                menuItems: true,
            },
        });
        return NextResponse.json(restaurants);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }
}

// POST endpoint for seeding/testing (optional, but requested "everything")
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const restaurant = await prisma.restaurant.create({
            data: {
                name: body.name,
                description: body.description,
                rating: body.rating,
                deliveryTime: body.deliveryTime,
            },
        });
        return NextResponse.json(restaurant);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
    }
}
