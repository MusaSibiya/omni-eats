'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { writeFile } from 'fs/promises';
import { join } from 'path';

async function checkOwner(restaurantId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized: Please login first');
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { ownerId: true }
    });

    if (!restaurant || restaurant.ownerId !== session.user.id) {
        throw new Error('Unauthorized: You do not own this restaurant');
    }
}

export async function updateRestaurantProfile(restaurantId: string, formData: FormData) {
    await checkOwner(restaurantId);

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { profileChangeLog: true, imageUrl: true }
    });

    if (!restaurant) throw new Error('Restaurant not found');

    // Handle change limit: 3 changes in 2 months
    const now = Date.now();
    const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000);

    let changeLog: number[] = [];
    try {
        changeLog = restaurant.profileChangeLog ? JSON.parse(restaurant.profileChangeLog) : [];
    } catch (e) {
        changeLog = [];
    }

    // Filter changes within last 2 months
    const recentChanges = changeLog.filter(ts => ts > twoMonthsAgo);

    if (recentChanges.length >= 3) {
        throw new Error('Profile update limit reached (3 changes per 2 months). Please try again later.');
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const cuisineType = formData.get('cuisineType') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const imageFile = formData.get('image') as File;

    let imageUrl = restaurant.imageUrl;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(path, buffer);
        imageUrl = `/uploads/${fileName}`;
    }

    // Update log
    recentChanges.push(now);

    await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
            name,
            description,
            cuisineType,
            deliveryTime,
            imageUrl,
            profileChangeLog: JSON.stringify(recentChanges)
        }
    });

    revalidatePath('/restaurant-dashboard/profile');
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${restaurantId}`);

    return { success: true, changesRemaining: 3 - recentChanges.length };
}

export async function createMenuItem(restaurantId: string, formData: FormData) {
    await checkOwner(restaurantId);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File;

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(path, buffer);
        imageUrl = `/uploads/${fileName}`;
    }

    await prisma.menuItem.create({
        data: {
            name,
            description,
            price,
            category,
            imageUrl: imageUrl,
            restaurantId,
        }
    });

    revalidatePath('/restaurant-dashboard/menu');
    revalidatePath(`/restaurants/${restaurantId}`);
    redirect('/restaurant-dashboard/menu');
}

export async function updateMenuItem(menuItemId: string, formData: FormData) {
    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        select: { restaurantId: true, imageUrl: true }
    });

    if (!menuItem) {
        throw new Error('Menu item not found');
    }

    await checkOwner(menuItem.restaurantId);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File;

    let imageUrl = menuItem.imageUrl;

    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
        const path = join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(path, buffer);
        imageUrl = `/uploads/${fileName}`;
    }

    await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
            name,
            description,
            price,
            category,
            imageUrl: imageUrl,
        }
    });

    revalidatePath('/restaurant-dashboard/menu');
    revalidatePath(`/restaurants/${menuItem.restaurantId}`);
    redirect('/restaurant-dashboard/menu');
}

export async function deleteMenuItem(menuItemId: string) {
    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        select: { restaurantId: true }
    });

    if (!menuItem) {
        throw new Error('Menu item not found');
    }

    await checkOwner(menuItem.restaurantId);

    await prisma.menuItem.delete({ where: { id: menuItemId } });

    revalidatePath('/restaurant-dashboard/menu');
    revalidatePath(`/restaurants/${menuItem.restaurantId}`);
}

export async function updateDashboardOrderStatus(orderId: string, newStatus: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    
    // In a multi-vendor cart, updating the whole order status implies all items are updated. 
    // Usually acceptable for standard MVP.
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });

    revalidatePath('/restaurant-dashboard/orders');
}
