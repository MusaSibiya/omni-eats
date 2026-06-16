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
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Driver Portal</h1>
                    <p className={styles.pageSubtitle}>
                        Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</span> &bull; Active Deliveries: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{myDeliveries.length}</span>
                    </p>
                </div>
                <RefreshButton className={styles.refreshBtn} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('AVAILABLE')}
                    className={activeTab === 'AVAILABLE' ? styles.primaryBtn : styles.signOutBtn}
                    style={{ flex: 1, minWidth: '200px' }}
                >
                    Available Orders <span style={{ marginLeft: '8px', padding: '2px 8px', background: activeTab === 'AVAILABLE' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.8rem' }}>{availableOrders.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('MY_DELIVERIES')}
                    className={activeTab === 'MY_DELIVERIES' ? styles.primaryBtn : styles.signOutBtn}
                    style={{ flex: 1, minWidth: '200px' }}
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
                                    <span className={styles.orderBadge} style={{ 
                                        background: order.status === 'READY' ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                                        color: order.status === 'READY' ? 'white' : 'var(--text-secondary)' 
                                    }}>
                                        {order.status === 'READY' ? 'READY FOR PICKUP' : 'COOKING'}
                                    </span>
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
                                    
                                    <div className={styles.orderCard}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <MapPin size={24} color="var(--accent-primary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Delivery To</p>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{order.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleAccept(order.id)}
                                    className={styles.primaryBtn}
                                    style={{ width: '100%', marginTop: '24px' }}
                                    disabled={loadingId === order.id}
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
                            <p className={styles.emptyStateText}>Accept an order from the available tab to start your run.</p>
                        </div>
                    ) : (
                        myDeliveries.map((order: any) => (
                            <div key={order.id} className={styles.orderColumn} style={{ borderColor: 'var(--accent-primary)', borderWidth: '2px' }}>
                                <div className={styles.orderColumnHeader}>
                                    <span className={styles.orderColumnTitle}>#{order.id.slice(-4).toUpperCase()}</span>
                                    <span className={styles.orderBadge} style={{ background: '#dcfce7', color: '#15803d' }}>
                                        {order.status === 'READY' ? 'PICKUP READY' : 'IN TRANSIT'}
                                    </span>
                                </div>
                                
                                <div className={styles.orderList}>
                                    <div className={styles.orderCard}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <Store size={24} color="var(--text-secondary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Pickup From</p>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{order.items[0]?.menuItem.restaurant.name || 'Unknown'}</p>
                                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{order.items[0]?.menuItem.restaurant.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.orderCard}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <MapPin size={24} color="var(--accent-primary)" />
                                            <div>
                                                <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Deliver To</p>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{order.address}</p>
                                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Customer: {order.user.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleComplete(order.id)}
                                    className={styles.primaryBtn}
                                    style={{ width: '100%', marginTop: '24px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                    disabled={loadingId === order.id}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <CheckCircle size={20} />
                                        {loadingId === order.id ? 'Completing...' : 'Mark as Delivered'}
                                    </div>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
