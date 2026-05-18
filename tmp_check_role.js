const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'rantlokakutullo@gmail.com' }
    });
    console.log(`User role: ${user.role}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
