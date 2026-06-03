import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const count = await prisma.notification.count({
            where: {
                userId: session.user.id,
                isRead: false,
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
