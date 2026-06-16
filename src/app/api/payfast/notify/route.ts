import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function buildSignature(params: Record<string, string>, passphrase: string): string {
    const queryString = Object.keys(params)
        .sort()
        .filter((k) => params[k] !== '' && k !== 'signature')
        .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
        .join('&');

    const stringToHash = passphrase
        ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
        : queryString;

    return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export async function POST(req: NextRequest) {
    try {
        console.log('=== PayFast ITN Received ===');

        // PayFast sends form-encoded data
        const body = await req.text();
        const params: Record<string, string> = {};
        new URLSearchParams(body).forEach((value, key) => {
            params[key] = value;
        });

        console.log('ITN Params:', params);

        const passphrase = process.env.PAYFAST_PASSPHRASE || '';
        const receivedSignature = params.signature;

        // 1. Verify signature
        const expectedSignature = buildSignature(params, passphrase);
        if (receivedSignature !== expectedSignature) {
            console.error('❌ PayFast ITN signature mismatch');
            return new NextResponse('Invalid signature', { status: 400 });
        }

        // 2. Verify payment status
        if (params.payment_status !== 'COMPLETE') {
            console.warn('PayFast payment not complete. Status:', params.payment_status);
            // Still return 200 so PayFast doesn't retry
            return new NextResponse('OK', { status: 200 });
        }

        const orderId = params.m_payment_id;
        const payfastPaymentId = params.pf_payment_id;
        const amount = parseFloat(params.amount_gross);

        if (!orderId) {
            console.error('❌ ITN missing m_payment_id');
            return new NextResponse('Missing order ID', { status: 400 });
        }

        // 3. Check if order exists and is not already paid (idempotency)
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!existingOrder) {
            console.error('❌ Order not found:', orderId);
            return new NextResponse('Order not found', { status: 404 });
        }

        if (existingOrder.payment) {
            console.log('Order already confirmed (idempotent):', orderId);
            return new NextResponse('OK', { status: 200 });
        }

        // 4. Create Payment record & update Order status
        await prisma.payment.upsert({
            where: { orderId },
            update: { status: 'COMPLETED' },
            create: {
                orderId,
                amount,
                status: 'COMPLETED',
                paymentMethod: 'PAYFAST',
                payfastPaymentId: payfastPaymentId || null,
            },
        });

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PREPARING',
                paymentStatus: 'PAID',
            },
        });

        // 5. Create Notifications for Restaurant Owners
        try {
            const restaurants = await prisma.restaurant.findMany({
                where: {
                    menuItems: {
                        some: {
                            orderItems: {
                                some: {
                                    orderId: orderId
                                }
                            }
                        }
                    }
                },
                select: {
                    ownerId: true,
                    name: true
                }
            });

            for (const restaurant of restaurants) {
                if (restaurant.ownerId) {
                    await prisma.notification.create({
                        data: {
                            userId: restaurant.ownerId,
                            title: 'New Order Received!',
                            message: `You have a new order for ${restaurant.name}. Order ID: #${orderId.slice(-4).toUpperCase()}`,
                            type: 'ORDER'
                        }
                    });
                }
            }
        } catch (notifError) {
            console.error('Failed to create PayFast order notifications:', notifError);
        }

        console.log('✅ PayFast ITN verified. Order confirmed:', orderId);
        return new NextResponse('OK', { status: 200 });
    } catch (error: any) {
        console.error('PayFast ITN Error:', error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
