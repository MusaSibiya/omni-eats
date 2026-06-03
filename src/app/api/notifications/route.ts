import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, title, message, type } = await req.json();

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || 'ORDER',
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Failed to create notification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
