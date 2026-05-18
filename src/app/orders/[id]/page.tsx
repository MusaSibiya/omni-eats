import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import OrderTrackerClient from './OrderTrackerClient';

export default async function OrderTrackingPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            driver: true,
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            }
        }
    });

    if (!order || order.userId !== session.user.id) {
        redirect('/orders');
    }

    // Sanitize order for client component (Prisma Decimal objects are not serializable)
    const sanitizedOrder = JSON.parse(JSON.stringify(order));

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
            <OrderTrackerClient order={sanitizedOrder} />
            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </main>
    );
}
