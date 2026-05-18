'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';

interface OrderTrackerClientProps {
    order: any;
}

export default function OrderTrackerClient({ order }: OrderTrackerClientProps) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Poll for updates every 3 seconds for real-time feel
        const interval = setInterval(() => {
            if (order.status !== 'DELIVERED') {
                router.refresh();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [order.status, router]);

    // Animate the progress bar locally for a smooth feel
    useEffect(() => {
        let targetProgress = 0;
        switch (order.status) {
            case 'PENDING': targetProgress = 10; break;
            case 'COOKING': targetProgress = 40; break;
            case 'READY': targetProgress = 50; break;
            case 'OUT_FOR_DELIVERY': targetProgress = 75; break;
            case 'DELIVERED': targetProgress = 100; break;
            default: targetProgress = 0;
        }
        const timer = setTimeout(() => setProgress(targetProgress), 300);
        return () => clearTimeout(timer);
    }, [order.status]);

    const getStatusText = () => {
        switch (order.status) {
            case 'PENDING': return 'Preparing your order...';
            case 'COOKING': return 'Cooking in progress...';
            case 'READY': return 'Waiting for Driver...';
            case 'OUT_FOR_DELIVERY': return 'Driver is on the way!';
            case 'DELIVERED': return 'Order Delivered!';
            default: return 'Processing...';
        }
    };

    const getStatusSubtitle = () => {
        switch (order.status) {
            case 'PENDING': return 'The restaurant has received your order and is reviewing it.';
            case 'COOKING': return 'The chef is firing up the grill. Your food is being prepared.';
            case 'READY': return 'Food is ready! Waiting for a driver to pick it up.';
            case 'OUT_FOR_DELIVERY': return 'Your driver has picked up your order and is heading to you.';
            case 'DELIVERED': return 'Enjoy your meal! Thank you for using Omni Eats.';
            default: return 'Processing...';
        }
    };

    const getETA = () => {
        if (order.status === 'DELIVERED') return 'Arrived';
        const orderDate = new Date(order.createdAt);
        // Fake ETA: 45 mins from order time
        orderDate.setMinutes(orderDate.getMinutes() + 45);
        return orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <BackButton style={{ marginBottom: '2rem' }} />
            
            <div style={{ background: 'var(--surface-primary)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                {/* Map/Hero Area Mock with Moving Vehicle */}
                <div style={{ height: '250px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
                    {/* Mock Map Grid lines */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Restaurant Location (Left) */}
                    <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--surface-primary)', border: '2px solid var(--text-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                            🏬
                        </div>
                    </div>

                    {/* Customer Location (Right) */}
                    <div style={{ position: 'absolute', top: '50%', left: '90%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--surface-primary)', border: '2px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                            🏠
                        </div>
                    </div>

                    {/* Route Line */}
                    <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)', borderTop: '2px dashed var(--border-color)', zIndex: 1 }}></div>

                    {/* Delivery Vehicle Container (Moving) */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: `${10 + (progress * 0.8)}%`, 
                        transform: 'translate(-50%, -50%)', 
                        transition: 'left 2s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {order.status !== 'DELIVERED' && (
                            <>
                                <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.15)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                                <div style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.3)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '0.5s' }}></div>
                            </>
                        )}
                        
                        <div style={{ background: order.status === 'DELIVERED' ? '#10b981' : 'var(--accent-primary)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 11, transition: 'background 0.5s' }}>
                            {order.status === 'DELIVERED' ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13"></rect>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                            )}
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Estimated Arrival</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{getETA()}</p>
                    </div>
                </div>

                {/* Status Content */}
                <div style={{ padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{getStatusText()}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>{getStatusSubtitle()}</p>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '3rem', position: 'relative' }}>
                        <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #FF6B35 0%, #E85D2A 100%)', 
                                width: `${progress}%`,
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                            <span style={{ color: order.status === 'PENDING' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>Received</span>
                            <span style={{ color: order.status === 'COOKING' ? 'var(--accent-primary)' : progress > 10 ? 'var(--text-primary)' : 'inherit' }}>Cooking</span>
                            <span style={{ color: order.status === 'OUT_FOR_DELIVERY' ? 'var(--accent-primary)' : progress > 50 ? 'var(--text-primary)' : 'inherit' }}>On Route</span>
                            <span style={{ color: order.status === 'DELIVERED' ? '#10b981' : 'inherit' }}>Delivered</span>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Order Details</h3>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                🍽️
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: '600' }}>{order.restaurant.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order #{order.id.slice(-4).toUpperCase()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {order.items.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                        <span style={{ fontWeight: '500' }}>{item.menuItem.name}</span>
                                    </div>
                                    <span style={{ fontWeight: '600' }}>R{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>R{Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(3); opacity: 0; }
                }
            `}} />
        </div>
    );
}
