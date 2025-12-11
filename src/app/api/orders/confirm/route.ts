import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

export async function POST(req: NextRequest) {
    try {
        const { paymentIntentId } = await req.json();

        if (!paymentIntentId) {
            return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
        }

        // 1. Retrieve the PaymentIntent from Stripe to verify status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json({ error: 'Payment not succeeded yet' }, { status: 400 });
        }

        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
            return NextResponse.json({ error: 'No orderId in payment metadata' }, { status: 404 });
        }

        // 2. Check if order is already processed (Idempotency)
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (existingOrder.paymentStatus === 'PAID' || existingOrder.payment) {
            console.log('Order already processed:', orderId);
            return NextResponse.json({ success: true, order: existingOrder });
        }

        // 3. Update the Order status in Database
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PREPARING', // Auto-move to preparing
                paymentStatus: 'PAID',
                payment: {
                    create: {
                        amount: Number(paymentIntent.amount) / 100,
                        status: 'COMPLETED',
                        paymentMethod: 'CARD', // Simplified
                        stripePaymentId: paymentIntentId
                    }
                }
            }
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Order Confirmation Error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
