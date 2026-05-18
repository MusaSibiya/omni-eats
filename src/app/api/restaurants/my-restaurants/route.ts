import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserRestaurants } from '@/lib/authorization';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const restaurants = await getUserRestaurants(session.user.id);

        return NextResponse.json({ restaurants });

    } catch (error: any) {
        console.error('Error fetching user restaurants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch restaurants', details: error.message },
            { status: 500 }
        );
    }
}
