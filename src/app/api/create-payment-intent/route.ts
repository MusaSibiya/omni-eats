import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Lazy initialization for Stripe
let stripe: Stripe | null = null;

function getStripe() {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-12-18.acacia' as any,
        });
    }
    return stripe;
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        console.log("DEBUG: Payment Intent Session:", session?.user?.email, "ID:", session?.user?.id);

        if (!session?.user?.id) {
            console.log("DEBUG: Unauthorized: No user ID provided in session.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, amount, deliveryAddress } = await req.json();
        console.log("DEBUG: Payment Intent Body:", { itemsCount: items?.length, amount, deliveryAddress });

        if (!items || items.length === 0) {
            console.log("DEBUG: Error: No items in cart");
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // Verify user exists in database to prevent Foreign Key constraints if DB is wiped
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!dbUser) {
            console.log("DEBUG: Error: User not found in database -", session.user.id);
            return NextResponse.json({ error: 'User does not exist in the database. Please sign out and sign in again.' }, { status: 404 });
        }

        // 0. Validate that all menu items exist (to avoid Foreign Key Violations if DB was refreshed)
        const itemIds = items.map((i: any) => i.id);
        const existingItems = await prisma.menuItem.findMany({
            where: { id: { in: itemIds } },
            select: { id: true }
        });

        if (existingItems.length !== items.length) {
            const foundIds = existingItems.map(i => i.id);
            const missingIds = itemIds.filter((id: string) => !foundIds.includes(id));
            console.log("Error: Stale items in cart - Missing IDs:", missingIds);
            return NextResponse.json({
                error: 'Some items in your cart are no longer available. Please clear your cart and re-add them.',
                missingIds
            }, { status: 400 });
        }

        if (amount < 10) {
            console.log("Error: Amount too small (under R10.00)");
            return NextResponse.json({ error: 'Order total must be at least R10.00 to process payment.' }, { status: 400 });
        }

        // 0.5. Determine Delivery Type based on Restaurant setting
        const restaurantId = items[0].restaurantId;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { deliveryAvailable: true }
        });

        const deliveryType = restaurant?.deliveryAvailable ? 'DELIVERY' : 'PICKUP';

        // 1. Create the Order in PENDING state
        console.log("Creating order in Prisma...");
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                total: amount,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                deliveryType: deliveryType,
                deliveryAddress: deliveryAddress || null,
                items: {
                    create: items.map((item: any) => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });
        console.log("Order created:", order.id);

        // 2. Create PaymentIntent linked to this Order
        const stripeInstance = getStripe();
        if (!stripeInstance) {
            console.warn("Stripe secret key missing - returning mock client secret for testing");
            // For testing without Stripe keys, return a mock client secret
            return NextResponse.json({
                clientSecret: 'mock_client_secret_' + order.id,
                orderId: order.id,
                isMock: true
            });
        }

        console.log("DEBUG: Creating Stripe PaymentIntent with Secret Key present:", !!process.env.STRIPE_SECRET_KEY);
        try {
            const paymentIntent = await stripeInstance.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'zar',
                automatic_payment_methods: { enabled: true },
                metadata: {
                    orderId: order.id,
                    userId: session.user.id
                }
            });
            console.log("DEBUG: Stripe PaymentIntent created successfully:", paymentIntent.id);

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                orderId: order.id
            });
        } catch (stripeError: any) {
            console.error("DEBUG: Stripe API call failed:", stripeError);
            return NextResponse.json(
                { error: `Stripe Error: ${stripeError.message}` },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('CRITICAL PAYMENT ERROR:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
