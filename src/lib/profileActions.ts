'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Update user profile
export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                phone,
            },
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'Failed to update profile' };
    }
}

// Change password
export async function changePassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { error: 'Current password is incorrect' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error('Password change error:', error);
        return { error: 'Failed to change password' };
    }
}

// Create address
export async function createAddress(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const label = formData.get('label') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const isDefault = formData.get('isDefault') === 'true';

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id },
                data: { isDefault: false },
            });
        }

        await prisma.address.create({
            data: {
                userId: user.id,
                label,
                street,
                city,
                province,
                postalCode,
                isDefault,
            },
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Address creation error:', error);
        return { error: 'Failed to create address' };
    }
}

// Update address
export async function updateAddress(addressId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    const label = formData.get('label') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const isDefault = formData.get('isDefault') === 'true';

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id, NOT: { id: addressId } },
                data: { isDefault: false },
            });
        }

        await prisma.address.update({
            where: { id: addressId },
            data: {
                label,
                street,
                city,
                province,
                postalCode,
                isDefault,
            },
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Address update error:', error);
        return { error: 'Failed to update address' };
    }
}

// Delete address
export async function deleteAddress(addressId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Not authenticated' };
    }

    try {
        await prisma.address.delete({
            where: { id: addressId },
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Address deletion error:', error);
        return { error: 'Failed to delete address' };
    }
}
