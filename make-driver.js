const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address as the first argument.');
        console.error('Usage: node make-driver.js <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        await prisma.user.update({
            where: { email },
            data: { role: 'DRIVER' }
        });

        console.log(`✅ Success! User ${email} has been upgraded to a DRIVER.`);
        console.log(`They can now access the Driver Portal!`);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
