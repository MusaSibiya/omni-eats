const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Querying db...");
    const users = await prisma.user.findMany({
        include: { restaurants: true }
    });
    for (const user of users) {
        const hasKutu = user.restaurants.some(r => r.name.toLowerCase().includes('kutu'));
        if (hasKutu) {
            console.log(`Email: ${user.email}, Name: ${user.name}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
