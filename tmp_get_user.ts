import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            name: {
               contains: 'rantlo kutu',
               mode: 'insensitive'
            }
        },
        include: {
            owner: true
        }
    });

    if (restaurant) {
        console.log(`Restaurant: ${restaurant.name}`);
        console.log(`Owner Email: ${restaurant.owner?.email}`);
        console.log(`Owner Name: ${restaurant.owner?.name}`);
    } else {
        console.log('Restaurant not found');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
