
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OrdersPageClient from './OrdersPageClient';

export default async function OrdersPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect('/login');
    }

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: {
                                select: { name: true }
                            }
                        }
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return <OrdersPageClient orders={orders} />;
}
