import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🖼️  Fixing broken image URLs...');

    const result = await prisma.menuItem.updateMany({
        where: {
            name: 'Full House Kota',
            imageUrl: 'https://images.unsplash.com/photo-1563245372-f217273229b4?auto=format&fit=crop&w=800&q=80'
        },
        data: {
            imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80'
        }
    });

    console.log(`✅ Updated ${result.count} images.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
