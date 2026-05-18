import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch owner's restaurant
        const restaurants = await prisma.restaurant.findMany({
            where: { ownerId: session.user.id }
        });

        const restaurant = restaurants[0];

        if (!restaurant) {
            return new NextResponse('No restaurant found', { status: 404 });
        }

        // Fetch orders containing items from this restaurant
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        menuItem: {
                            restaurantId: restaurant.id
                        }
                    }
                }
            },
            include: {
                user: true,
                items: {
                    where: {
                        menuItem: {
                            restaurantId: restaurant.id
                        }
                    },
                    include: { menuItem: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate CSV rows
        // Headers: Order ID, Date, Customer Name, Customer Email, Status, Items, Total (ZAR)
        let csvContent = 'Order ID,Date,Customer Name,Customer Email,Status,Items Ordered,Total Amount (ZAR)\n';

        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            const customerName = `"${order.user?.name || 'Guest'}"`;
            const customerEmail = `"${order.user?.email || 'N/A'}"`;
            
            // Format items into a single string
            const itemsOrdered = `"${order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join('; ')}"`;
            
            // Calculate revenue for this restaurant from this order
            let orderTotal = 0;
            order.items.forEach(item => {
                orderTotal += Number(item.price) * item.quantity;
            });

            csvContent += `${order.id},${date},${customerName},${customerEmail},${order.status},${itemsOrdered},${orderTotal.toFixed(2)}\n`;
        });

        const now = new Date().toISOString().split('T')[0];
        const filename = `${restaurant.name.replace(/\s+/g, '_')}_Financial_Report_${now}.csv`;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('CSV Generation Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
