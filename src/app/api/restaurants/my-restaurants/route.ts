import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserRestaurants } from '@/lib/authorization';
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

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const restaurants = await getUserRestaurants(session.user.id);

        return NextResponse.json({ restaurants: sanitizeData(restaurants) });

    } catch (error: any) {
        console.error('Error fetching user restaurants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch restaurants', details: error.message },
            { status: 500 }
        );
    }
}
