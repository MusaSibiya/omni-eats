const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.user.update({
        where: { email: 'rantlokakutullo@gmail.com' },
        data: { role: 'RESTAURANT_OWNER' }
    });
    console.log("Role upgraded to RESTAURANT_OWNER!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
