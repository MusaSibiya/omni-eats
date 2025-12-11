import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function checkAdmin() {
    console.log('Checking for admin account...\n');

    const admin = await prisma.user.findUnique({
        where: { email: 'admin@omni.com' }
    });

    if (!admin) {
        console.log('❌ Admin account NOT found!');
        console.log('Creating admin account...');

        const hashedPassword = await bcrypt.hash('password123', 10);
        const newAdmin = await prisma.user.create({
            data: {
                email: 'admin@omni.com',
                name: 'Admin User',
                role: 'ADMIN',
                password: hashedPassword,
            }
        });

        console.log('✅ Admin account created successfully!');
        console.log('Email:', newAdmin.email);
        console.log('Role:', newAdmin.role);
    } else {
        console.log('✅ Admin account found!');
        console.log('Email:', admin.email);
        console.log('Name:', admin.name);
        console.log('Role:', admin.role);
        console.log('Password hash exists:', !!admin.password);

        // Test password
        const testPassword = 'password123';
        const passwordMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('\nPassword verification test:');
        console.log('Testing password: password123');
        console.log('Result:', passwordMatch ? '✅ MATCH' : '❌ NO MATCH');
    }

    await prisma.$disconnect();
}

checkAdmin().catch(console.error);
