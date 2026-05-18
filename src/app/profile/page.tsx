import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { updateProfile, changePassword, createAddress, deleteAddress } from '@/lib/profileActions';
import Link from 'next/link';
import styles from './profile.module.css';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            addresses: {
                orderBy: { isDefault: 'desc' }
            },
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>My Profile</h1>

                    {/* Profile Information */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Personal Information</h2>
                        <form action={updateProfile} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        defaultValue={user.name || ''}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    defaultValue={user.phone || ''}
                                    className={styles.input}
                                    placeholder="+27 XX XXX XXXX"
                                />
                            </div>
                            <button type="submit" className={styles.primaryBtn}>
                                Save Changes
                            </button>
                        </form>
                    </section>

                    {/* Change Password */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Change Password</h2>
                        <form action={changePassword} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        required
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.primaryBtn}>
                                Update Password
                            </button>
                        </form>
                    </section>

                    {/* Delivery Addresses */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Delivery Addresses</h2>
                            <Link href="/profile/addresses/new">
                                <button className={styles.primaryBtn}>+ Add Address</button>
                            </Link>
                        </div>
                        {user.addresses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No delivery addresses yet. Add one to make checkout faster!</p>
                            </div>
                        ) : (
                            <div className={styles.addressGrid}>
                                {user.addresses.map(address => (
                                    <div key={address.id} className={styles.addressCard}>
                                        <div className={styles.addressHeader}>
                                            <h3>{address.label}</h3>
                                            {address.isDefault && (
                                                <span className={styles.defaultBadge}>Default</span>
                                            )}
                                        </div>
                                        <p className={styles.addressText}>
                                            {address.street}<br />
                                            {address.city}, {address.province}<br />
                                            {address.postalCode}
                                        </p>
                                        <div className={styles.addressActions}>
                                            <Link href={`/profile/addresses/${address.id}`}>
                                                <button className={styles.secondaryBtn}>Edit</button>
                                            </Link>
                                            <form action={deleteAddress.bind(null, address.id)}>
                                                <button type="submit" className={styles.dangerBtn}>Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent Orders */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Recent Orders</h2>
                            <Link href="/orders">
                                <button className={styles.secondaryBtn}>View All</button>
                            </Link>
                        </div>
                        {user.orders.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No orders yet. Start exploring restaurants!</p>
                            </div>
                        ) : (
                            <div className={styles.orderList}>
                                {user.orders.map(order => (
                                    <div key={order.id} className={styles.orderItem}>
                                        <div>
                                            <p className={styles.orderId}>Order #{order.id.slice(-4).toUpperCase()}</p>
                                            <p className={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={styles.orderRight}>
                                            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                {order.status}
                                            </span>
                                            <p className={styles.orderTotal}>R{Number(order.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
