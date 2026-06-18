import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import OrderTrackerClient from './OrderTrackerClient';
import styles from './page.module.css';

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
        <main className={styles.main}>
            <div className={styles.container}>
                <OrderTrackerClient order={sanitizedOrder} />
            </div>
            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </main>
    );
}
