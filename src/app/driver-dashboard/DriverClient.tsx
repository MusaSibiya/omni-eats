'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptDelivery, completeDelivery } from '@/lib/driverActions';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { MapPin, Store, CheckCircle, PackageSearch, Bike } from 'lucide-react';
import styles from '../admin/admin.module.css';

export default function DriverClient({ user, availableOrders, myDeliveries }: any) {
    const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'MY_DELIVERIES'>('AVAILABLE');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleAccept = async (orderId: string) => {
        try {
            setLoadingId(orderId);
            await acceptDelivery(orderId);
            setActiveTab('MY_DELIVERIES');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoadingId(null);
        }
    };

    const handleComplete = async (orderId: string) => {
        try {
            setLoadingId(orderId);
            await completeDelivery(orderId);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
            <div className={styles.pageHeader} style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.pageTitle}>Driver Portal</h1>
                    <p className={styles.pageSubtitle}>
                        Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</span> &bull; Active Deliveries: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{myDeliveries.length}</span>
                    </p>
                </div>
                <RefreshButton className={styles.refreshBtn} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <button 
                    onClick={() => setActiveTab('AVAILABLE')}
                    className={activeTab === 'AVAILABLE' ? styles.primaryBtn : styles.dangerBtn}
                    style={activeTab === 'AVAILABLE' ? {} : { color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }}
                >
                    Available Orders <span style={{ marginLeft: '8px', padding: '2px 8px', background: activeTab === 'AVAILABLE' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.8rem' }}>{availableOrders.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('MY_DELIVERIES')}
                    className={activeTab === 'MY_DELIVERIES' ? styles.primaryBtn : styles.dangerBtn}
                    style={activeTab === 'MY_DELIVERIES' ? {} : { color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }}
                >
                    My Deliveries <span style={{ marginLeft: '8px', padding: '2px 8px', background: activeTab === 'MY_DELIVERIES' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.8rem' }}>{myDeliveries.length}</span>
                </button>
            </div>

            {activeTab === 'AVAILABLE' && (
                <div className={styles.orderGrid}>
                    {availableOrders.length === 0 ? (
                        <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                            <PackageSearch className={styles.emptyStateIcon} style={{ margin: '0 auto 16px auto', display: 'block' }} />
                            <h3 className={styles.emptyStateText} style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.5rem' }}>No orders available</h3>
                            <p className={styles.emptyStateText}>Check back soon for new delivery requests in your area.</p>
                        </div>
                    ) : (
                        availableOrders.map((order: any) => (
                            <div key={order.id} className={styles.orderColumn}>
                                <div className={styles.orderColumnHeader}>
                                    <span className={styles.orderColumnTitle}>#{order.id.slice(-4).toUpperCase()}</span>
                                    <span className={styles.orderBadge} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>WAITING</span>
                                </div>
                                <div className={styles.orderList}>
                                    <div className={styles.orderCard}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <Store size={24} color="var(--text-secondary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Pickup From</p>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{order.items[0]?.menuItem.restaurant.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleAccept(order.id)}
                                    disabled={loadingId === order.id}
                                    className={styles.primaryBtn}
                                    style={{ width: '100%', marginTop: '24px' }}
                                >
                                    {loadingId === order.id ? 'Accepting...' : 'Accept Delivery'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'MY_DELIVERIES' && (
                <div className={styles.orderGrid}>
                    {myDeliveries.length === 0 ? (
                        <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                            <Bike className={styles.emptyStateIcon} style={{ margin: '0 auto 16px auto', display: 'block' }} />
                            <h3 className={styles.emptyStateText} style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.5rem' }}>No active deliveries</h3>
                            <p className={styles.emptyStateText}>Accept an order from the Available tab to start earning.</p>
                        </div>
                    ) : (
                        myDeliveries.map((order: any) => (
                            <div key={order.id} className={styles.orderColumn} style={{ borderColor: 'var(--accent-primary)' }}>
                                <div className={styles.orderColumnHeader}>
                                    <span className={styles.orderColumnTitle}>#{order.id.slice(-4).toUpperCase()}</span>
                                    <span className={styles.orderBadge}>ON ROUTE</span>
                                </div>
                                <div className={styles.orderList}>
                                    <div className={styles.orderCard}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '16px' }}>
                                            <Store size={20} color="var(--text-secondary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>Pickup</p>
                                                <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>{order.items[0]?.menuItem.restaurant.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <MapPin size={20} color="var(--text-secondary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>Dropoff</p>
                                                <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>{order.user?.name || 'Guest Customer'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleComplete(order.id)}
                                    disabled={loadingId === order.id}
                                    className={styles.primaryBtn}
                                    style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {loadingId === order.id ? 'Completing...' : <><CheckCircle size={18} /> Mark as Delivered</>}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
