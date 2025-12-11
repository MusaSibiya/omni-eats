import { prisma } from '@/lib/prisma';
import styles from '../admin.module.css';

export default async function AdminUsers() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>User Management</h1>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Orders</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: '600' }}>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: user.role === 'ADMIN' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                                        color: user.role === 'ADMIN' ? 'white' : '#6b7280'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user._count.orders}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>👥</div>
                        <p className={styles.emptyStateText}>No users found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
