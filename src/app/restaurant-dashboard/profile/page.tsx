import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import styles from '../../admin/admin.module.css';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Fetch owner's restaurant
    const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: session.user.id }
    });

    const restaurant = restaurants[0];

    if (!restaurant) {
        return (
            <div className={styles.dashboardContainer}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h1 style={{ color: 'white' }}>No Restaurant Found</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>You need to register a restaurant first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'white', fontWeight: 600 }}>Restaurant Information</h2>

                    <ProfileForm restaurant={restaurant as any} />
                </div>
            </div>
        </div>
    );
}
