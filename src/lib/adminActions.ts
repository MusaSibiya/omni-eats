'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function createRestaurant(formData: FormData) {
    await checkAdmin();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.restaurant.create({
        data: {
            name,
            description,
            deliveryTime,
            imageUrl: imageUrl || '/images/restaurant-hero.png',
            rating: 4.5,
        }
    });

    revalidatePath('/admin/restaurants');
    revalidatePath('/restaurants');
    redirect('/admin/restaurants');
}

export async function updateRestaurant(restaurantId: string, formData: FormData) {
    await checkAdmin();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const deliveryTime = formData.get('deliveryTime') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
            name,
            description,
            deliveryTime,
            imageUrl: imageUrl || '/images/restaurant-hero.png',
        }
    });

    revalidatePath('/admin/restaurants');
    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath('/restaurants');
    redirect('/admin/restaurants');
}

export async function deleteRestaurant(id: string) {
    await checkAdmin();
    await prisma.restaurant.delete({ where: { id } });
    revalidatePath('/admin/restaurants');
}

export async function createMenuItem(restaurantId: string, formData: FormData) {
    await checkAdmin();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.menuItem.create({
        data: {
            name,
            description,
            price,
            category,
            imageUrl,
            restaurantId,
        }
    });

    revalidatePath(`/admin/restaurants/${restaurantId}`);
    revalidatePath(`/restaurants/${restaurantId}`);
}

export async function updateMenuItem(menuItemId: string, formData: FormData) {
    await checkAdmin();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
            name,
            description,
            price,
            category,
            imageUrl,
        }
    });

    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        select: { restaurantId: true }
    });

    if (menuItem) {
        revalidatePath(`/admin/restaurants/${menuItem.restaurantId}`);
        revalidatePath(`/restaurants/${menuItem.restaurantId}`);
    }
}

export async function deleteMenuItem(menuItemId: string) {
    await checkAdmin();

    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
        select: { restaurantId: true }
    });

    await prisma.menuItem.delete({ where: { id: menuItemId } });

    if (menuItem) {
        revalidatePath(`/admin/restaurants/${menuItem.restaurantId}`);
        revalidatePath(`/restaurants/${menuItem.restaurantId}`);
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    await checkAdmin();

    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });

    revalidatePath('/admin/orders');
    revalidatePath('/orders');
}
