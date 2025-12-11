import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any, // Use latest API version or default
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        console.log("Payment Intent Session:", session);
        if (!session?.user?.id) {
            console.log("Unauthorized: No user ID provided.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, amount } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // 1. Create the Order in PENDING state
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                total: amount,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        price: item.price // Assuming item.price is passed from cart
                    }))
                }
            }
        });

        // 2. Create PaymentIntent linked to this Order
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'zar',
            automatic_payment_methods: { enabled: true },
            metadata: {
                orderId: order.id,
                userId: session.user.id
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            orderId: order.id
        });
    } catch (error: any) {
        console.error('Internal Error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
