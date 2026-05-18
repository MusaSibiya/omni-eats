const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("Updating password...");
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.update({
        where: { email: 'rantlokakutullo@gmail.com' },
        data: { password: hashedPassword }
    });
    console.log("Password updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
