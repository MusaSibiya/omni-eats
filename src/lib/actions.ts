'use server';


import { AuthError } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn, signOut, auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        console.log('🔐 Authentication attempt:', { email, passwordLength: password?.length });

        const user = await prisma.user.findUnique({ where: { email } });
        console.log('👤 User found:', user ? `Yes (${user.role})` : 'No');

        const redirectTo = user?.role === 'ADMIN' ? '/admin' : '/';
        console.log('🔄 Redirect target:', redirectTo);

        await signIn('credentials', {
            email,
            password,
            redirectTo,
            redirect: true
        });
    } catch (error) {
        console.error('❌ Authentication error:', error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const { name, email, password } = Object.fromEntries(formData);

    // Basic validation
    if (!name || !email || !password || typeof password !== 'string' || password.length < 6) {
        return 'Please provide a valid name, email, and password (min 6 chars).';
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData: Prisma.UserCreateInput = {
            name: name as string,
            email: email as string,
            password: hashedPassword,
        };

        await prisma.user.create({
            data: userData,
        });

    } catch (error) {
        console.error('Registration failed:', error);
        return 'Registration failed. User may already exist.';
    }

    // Redirect to login with success flag
    redirect('/login?registered=true');
}

export async function handleSignOut() {
    await signOut({ redirectTo: '/' });
}

export async function placeOrder(items: { id: string; quantity: number }[]) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Not authenticated');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (!items || items.length === 0) {
        throw new Error('No items in cart');
    }

    // Calculate total and verify prices
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.id },
        });

        if (!menuItem) {
            throw new Error(`Menu item not found: ${item.id}`);
        }

        const price = Number(menuItem.price);
        total += price * item.quantity;
        orderItemsData.push({
            menuItemId: menuItem.id,
            quantity: item.quantity,
            price: menuItem.price,
        });
    }

    // Create the order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            total: total,
            status: 'PENDING',
            items: {
                create: orderItemsData,
            },
        },
    });

    return { success: true, orderId: order.id };
}
