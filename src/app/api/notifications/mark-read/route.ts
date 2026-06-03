import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();

        if (id) {
            await prisma.notification.update({
                where: { id },
                data: { isRead: true },
            });
        } else {
            // Mark all as read if no ID provided
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
