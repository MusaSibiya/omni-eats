const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderId = "cmpavt1zm0002v2n0a1rlh93b";
    try {
        console.log("Trying upsert payment...");
        const payment = await prisma.payment.upsert({
            where: { orderId: orderId },
            update: {
                status: 'COMPLETED'
            },
            create: {
                orderId: orderId,
                amount: 60,
                status: 'COMPLETED',
                paymentMethod: 'STRIPE_CARD',
                payfastPaymentId: 'pi_test_123'
            }
        });
        console.log("Payment upserted:", payment);

        console.log("Trying update order...");
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PENDING',
                paymentStatus: 'PAID'
            },
            include: { payment: true }
        });
        console.log("Order updated:", updatedOrder.id);
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
