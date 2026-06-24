'use server';


import { AuthError } from 'next-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn, signOut, auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        console.log('🔍 Looking for user with email:', email);
        const user = await prisma.user.findUnique({ where: { email } });
        console.log('👤 Found user:', user ? 'Yes' : 'No');

        // Determine redirect based on role
        let redirectTo = '/';
        if (user?.role === 'ADMIN') {
            redirectTo = '/admin';
        } else if (user?.role === 'RESTAURANT_OWNER') {
            redirectTo = '/restaurant-dashboard';
        } else if (user?.role === 'DRIVER') {
            redirectTo = '/driver-dashboard';
        }

        console.log('🔐 Attempting sign in...');
        try {
            await signIn('credentials', {
                email,
                password,
                redirect: false
            });
            console.log('✅ Sign in successful!');
        } catch (error) {
            console.error('❌ Sign in error:', error);
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return 'Invalid credentials.';
                    default:
                        return `Auth error: ${error.message}`;
                }
            }
            throw error;
        }

        // Force cache revalidation and redirect
        revalidatePath('/', 'layout');
        console.log('🔄 Redirecting to:', redirectTo);
        redirect(redirectTo);

    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('❌ Unhandled authentication error:', error);
        return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const { name, email, password, confirmPassword } = Object.fromEntries(formData);

    // Basic validation
    if (!name || !email || !password || typeof password !== 'string' || password.length < 6) {
        return 'Please provide a valid name, email, and password (min 6 chars).';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match.';
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email as string)) {
        return 'Please provide a valid email address.';
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

        // Auto-login after registration
        try {
            await signIn('credentials', {
                email: email as string,
                password: password as string,
                redirect: false
            });
        } catch (error) {
            console.error('Auto-login failed after registration:', error);
            // Even if auto-login fails, account was created. Redirect to login.
            redirect('/login?registered=true');
        }

        // Force cache revalidation and redirect
        revalidatePath('/', 'layout');
        redirect('/');

    } catch (error) {
        // Re-throw redirect errors so Next.js can handle them
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Registration failed:', error);
        return 'Registration failed. User may already exist.';
    }
}

export async function handleSignOut() {
    revalidatePath('/', 'layout');
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
