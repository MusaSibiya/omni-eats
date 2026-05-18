import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DriverClient from './DriverClient';

export default async function DriverDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'DRIVER') {
        // In a real app we'd show an unauthorized page or redirect, but for demo, let's allow viewing or redirect to home
        // We'll redirect to home for safety
        redirect('/');
    }

    // Fetch orders that are COOKING or READY, not assigned, AND are DELIVERY type
    const availableOrders = await prisma.order.findMany({
        where: {
            status: { in: ['COOKING', 'READY'] },
            deliveryType: 'DELIVERY',
            driverId: null
        },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Fetch driver's active deliveries
    const myDeliveries = await prisma.order.findMany({
        where: {
            driverId: user.id,
            status: 'OUT_FOR_DELIVERY'
        },
        include: {
            user: true,
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return <DriverClient user={user} availableOrders={availableOrders} myDeliveries={myDeliveries} />;
}
