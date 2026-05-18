'use server';

import { prisma } from './prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function applyToBeDriver(formData: FormData) {
    const session = await auth();
    
    // If user is already logged in, just update their role
    if (session?.user?.id) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { role: 'DRIVER' }
        });
        return { success: true, message: 'You are now a driver!' };
    }

    // New driver registration
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
        throw new Error('Name, email, and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Please provide a valid email address');
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email already registered. Please login first to apply as a driver.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            email,
            name,
            phone,
            password: hashedPassword,
            role: 'DRIVER'
        }
    });

    return { success: true, message: 'Driver account created successfully! You can now login.' };
}

export async function acceptDelivery(orderId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Not authenticated');

    // Make sure user is a DRIVER (or allow for demo purposes)
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== 'DRIVER') {
        // For testing purposes, we can optionally auto-upgrade them or just allow it if we want it to be easy to test.
        // Let's enforce it but provide a test script to make someone a driver.
        throw new Error('Not authorized as driver');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.driverId) throw new Error('Order already claimed');

    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'OUT_FOR_DELIVERY',
            driverId: session.user.id,
        }
    });

    revalidatePath('/driver-dashboard');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/orders');
}

export async function completeDelivery(orderId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Not authenticated');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    if (order.driverId !== session.user.id) throw new Error('Not your delivery');

    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'DELIVERED',
        }
    });

    revalidatePath('/driver-dashboard');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/orders');
}
