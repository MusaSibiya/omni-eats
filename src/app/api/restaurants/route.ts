import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Helper to convert Prisma Decimals to Numbers for JSON serialization
function sanitizeData(data: any): any {
    if (data === null || data === undefined) return data;
    
    if (data instanceof Decimal) {
        return Number(data);
    }
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }
    
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const key in data) {
            sanitized[key] = sanitizeData(data[key]);
        }
        return sanitized;
    }
    
    return data;
}

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
        return NextResponse.json(sanitizeData(restaurants));
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
