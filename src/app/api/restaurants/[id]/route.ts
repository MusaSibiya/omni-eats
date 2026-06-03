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

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                menuItems: true,
                reviews: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        return NextResponse.json(sanitizeData(restaurant));
    } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
