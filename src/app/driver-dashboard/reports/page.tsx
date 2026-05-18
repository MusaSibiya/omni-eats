import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RefreshButton } from '@/components/ui/RefreshButton';
import styles from '../../admin/admin.module.css';

export default async function DriverReportsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'DRIVER') {
        redirect('/');
    }

    // Fetch driver's COMPLETED deliveries
    const deliveredOrders = await prisma.order.findMany({
        where: {
            driverId: user.id,
            status: 'DELIVERED'
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

    const totalEarned = deliveredOrders.length * 35; // Assuming fixed R35 base delivery fee for demo

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div className={styles.pageHeader} style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.pageTitle}>Earnings & Reports</h1>
                    <p className={styles.pageSubtitle}>
                        Track your completed deliveries and earnings.
                    </p>
                </div>
                <RefreshButton className={styles.refreshBtn} />
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Deliveries</div>
                    <div className={styles.statValue}>{deliveredOrders.length}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Earned</div>
                    <div className={styles.statValue} style={{ color: '#10b981' }}>R{totalEarned.toFixed(2)}</div>
                </div>
            </div>

            <div className={styles.tableContainer} style={{ marginTop: '2rem' }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Pickup</th>
                            <th>Dropoff</th>
                            <th>Base Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    No completed deliveries yet.
                                </td>
                            </tr>
                        ) : (
                            deliveredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>#{order.id.slice(-4).toUpperCase()}</td>
                                    <td>{new Date(order.updatedAt).toLocaleDateString()}</td>
                                    <td>{order.items[0]?.menuItem?.restaurant?.name || 'Unknown'}</td>
                                    <td>{order.user?.name || 'Guest'}</td>
                                    <td style={{ fontWeight: '600', color: '#10b981' }}>R35.00</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
