import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function buildSignature(params: Record<string, string>, passphrase: string): string {
    // Sort keys alphabetically, build query string, append passphrase, MD5
    const queryString = Object.keys(params)
        .sort()
        .filter((k) => params[k] !== '')
        .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
        .join('&');

    const stringToHash = passphrase
        ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
        : queryString;

    return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, amount } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // Validate all menu items exist
        const itemIds = items.map((i: any) => i.id);
        const existingItems = await prisma.menuItem.findMany({
            where: { id: { in: itemIds } },
            select: { id: true },
        });

        if (existingItems.length !== items.length) {
            const foundIds = existingItems.map((i) => i.id);
            const missingIds = itemIds.filter((id: string) => !foundIds.includes(id));
            return NextResponse.json(
                {
                    error: 'Some items in your cart are no longer available. Please clear your cart and re-add them.',
                    missingIds,
                },
                { status: 400 }
            );
        }

        if (amount < 10) {
            return NextResponse.json(
                { error: 'Order total must be at least R10.00 to process payment.' },
                { status: 400 }
            );
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
                        price: item.price,
                    })),
                },
            },
        });

        // 2. Fetch user details for PayFast
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
        const passphrase = process.env.PAYFAST_PASSPHRASE || '';

        // 3. Build PayFast parameters
        const nameParts = (user?.name || 'Customer').split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';

        const rawParams: Record<string, string> = {
            merchant_id: merchantId,
            merchant_key: merchantKey,
            return_url: `${baseUrl}/checkout/success?orderId=${order.id}`,
            cancel_url: `${baseUrl}/checkout?cancelled=true`,
            notify_url: `${baseUrl}/api/payfast/notify`,
            name_first: firstName,
            name_last: lastName,
            email_address: user?.email || '',
            m_payment_id: order.id,
            amount: amount.toFixed(2),
            item_name: `Sotobe Eats Order #${order.id.slice(-4).toUpperCase()}`,
        };

        const params: Record<string, string> = {};
        for (const key in rawParams) {
            // Payfast requires completely omitting empty parameters
            if (rawParams[key] !== '') {
                params[key] = rawParams[key].trim();
            }
        }

        // 4. Generate signature

        const signature = buildSignature(params, passphrase);
        params.signature = signature;

        return NextResponse.json({
            orderId: order.id,
            payfastParams: params,
            payfastUrl: 'https://sandbox.payfast.co.za/eng/process',
        });
    } catch (error: any) {
        console.error('PayFast Initiate Error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
