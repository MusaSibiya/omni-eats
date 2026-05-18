import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const restaurants = await prisma.restaurant.findMany({
        include: { _count: { select: { menuItems: true } } }
    });

    const empty = restaurants.filter((r: any) => r._count.menuItems === 0);

    console.log('--- EMPTY RESTAURANTS ---');
    empty.forEach((r: any) => {
        console.log(`ID: ${r.id} | NAME: ${r.name}`);
    });
    console.log('--- END ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
