import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as any,
});

export async function POST(req: NextRequest) {
    try {
        console.log('=== Order Confirm Endpoint Called ===');
        const { paymentIntentId } = await req.json();
        console.log('Received paymentIntentId:', paymentIntentId);

        if (!paymentIntentId) {
            console.error('Error: Missing paymentIntentId');
            return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
        }

        // 1. Retrieve the PaymentIntent from Stripe to verify status
        console.log('Attempting to retrieve PaymentIntent from Stripe...');
        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            console.log('PaymentIntent retrieved:', {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                metadata: paymentIntent.metadata
            });
        } catch (stripeError: any) {
            console.error('Stripe API Error:', stripeError.message);
            console.error('Stripe Error Details:', {
                type: stripeError.type,
                code: stripeError.code,
                statusCode: stripeError.statusCode
            });
            return NextResponse.json({
                error: 'Failed to retrieve payment from Stripe',
                details: stripeError.message
            }, { status: 500 });
        }

        if (paymentIntent.status !== 'succeeded') {
            console.warn('Payment not succeeded. Status:', paymentIntent.status);
            return NextResponse.json({ error: 'Payment not succeeded yet' }, { status: 400 });
        }

        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
            console.error('Confirm Error: No orderId in metadata', paymentIntent.id);
            return NextResponse.json({ error: 'No orderId in payment metadata' }, { status: 404 });
        }

        // 2. Check if order is already processed (Idempotency)
        console.log('Searching for Order:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!existingOrder) {
            console.error('Confirm Error: Order not found in DB', orderId);
            return NextResponse.json({
                error: 'Order not found',
                details: `Order ID ${orderId} does not exist in database`
            }, { status: 404 });
        }

        // If order already has payment, return success (idempotency)
        if (existingOrder.payment) {
            console.log('Order already has payment, returning existing order:', orderId);

            // Make sure order status is updated
            if (existingOrder.paymentStatus !== 'PAID') {
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PENDING',
                        paymentStatus: 'PAID'
                    }
                });
            }

            return NextResponse.json({
                success: true,
                order: existingOrder,
                message: 'Order already confirmed'
            });
        }

        console.log('✅ Payment succeeded, updating order...');
        console.log('Order data before update:', JSON.stringify(existingOrder, null, 2));

        // 3. Update the Order status in Database using a transaction
        try {
            // Use upsert to handle race conditions
            const payment = await prisma.payment.upsert({
                where: { orderId: orderId },
                update: {
                    // If it exists, just return it
                    status: 'COMPLETED'
                },
                create: {
                    orderId: orderId,
                    amount: Number(paymentIntent.amount) / 100,
                    status: 'COMPLETED',
                    paymentMethod: 'STRIPE_CARD',
                    payfastPaymentId: paymentIntentId
                }
            });

            console.log('Payment record ensured:', payment.id);

            // Update order status
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'PENDING',
                    paymentStatus: 'PAID'
                },
                include: { payment: true }
            });

            console.log('✅ Order updated successfully:', updatedOrder.id);

            // 4. Create Notifications for Restaurant Owners
            try {
                // Get unique restaurant owners for this order
                const restaurants = await prisma.restaurant.findMany({
                    where: {
                        menuItems: {
                            some: {
                                orderItems: {
                                    some: {
                                        orderId: updatedOrder.id
                                    }
                                }
                            }
                        }
                    },
                    select: {
                        userId: true,
                        name: true
                    }
                });

                for (const restaurant of restaurants) {
                    await prisma.notification.create({
                        data: {
                            userId: restaurant.userId,
                            title: 'New Order Received!',
                            message: `You have a new order for ${restaurant.name}. Order ID: #${updatedOrder.id.slice(-4).toUpperCase()}`,
                            type: 'ORDER'
                        }
                    });
                }
                console.log(`✅ Notifications created for ${restaurants.length} restaurants`);
            } catch (notifError) {
                console.error('Failed to create order notifications:', notifError);
                // Don't fail the whole request if notifications fail
            }

            return NextResponse.json({
                success: true,
                order: updatedOrder,
                message: 'Order confirmed successfully'
            });
        } catch (updateError: any) {
            console.error('❌ Failed to update order:', updateError.message);
            console.error('Error code:', updateError.code);
            console.error('Full error:', updateError);

            // If it's a unique constraint error, the payment already exists
            // Fetch the order with payment and return success
            if (updateError.code === 'P2002') {
                console.log('Payment already exists (P2002), fetching order...');
                const orderWithPayment = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { payment: true }
                });

                if (orderWithPayment) {
                    return NextResponse.json({
                        success: true,
                        order: orderWithPayment,
                        message: 'Order already confirmed'
                    });
                }
            }

            return NextResponse.json({
                error: 'Failed to update order',
                details: updateError.message
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Order Confirmation Error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
