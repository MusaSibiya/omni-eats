import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const formData = await req.formData();

        const restaurantName = formData.get('restaurantName') as string;
        const description = formData.get('description') as string;
        const cuisineType = formData.get('cuisineType') as string;
        const dietaryOptions = formData.get('dietaryOptions') as string;
        const deliveryTime = formData.get('deliveryTime') as string;

        // Owner details
        const ownerName = formData.get('ownerName') as string;
        const ownerEmail = formData.get('ownerEmail') as string;
        const ownerPhone = formData.get('ownerPhone') as string;
        const ownerPassword = formData.get('ownerPassword') as string;

        // Image handling
        const imageFile = formData.get('image') as File;
        let imageUrl = '';

        if (imageFile) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
            const path = join(process.cwd(), 'public', 'uploads', fileName);
            await writeFile(path, buffer);
            imageUrl = `/uploads/${fileName}`;
            console.log('Image saved to:', imageUrl);
        }

        // Validation
        if (!restaurantName || !cuisineType) {
            return NextResponse.json(
                { error: 'Restaurant name and cuisine type are required' },
                { status: 400 }
            );
        }

        let userId = session?.user?.id;

        // If user is not logged in, create a new account
        if (!userId) {
            const ownerConfirmPassword = formData.get('ownerConfirmPassword') as string;

            if (!ownerEmail || !ownerPassword || !ownerName) {
                return NextResponse.json(
                    { error: 'Owner details are required for new accounts' },
                    { status: 400 }
                );
            }

            if (ownerPassword !== ownerConfirmPassword) {
                return NextResponse.json(
                    { error: 'Passwords do not match.' },
                    { status: 400 }
                );
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(ownerEmail)) {
                return NextResponse.json(
                    { error: 'Please provide a valid email address.' },
                    { status: 400 }
                );
            }

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: ownerEmail }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already registered. Please login first.' },
                    { status: 400 }
                );
            }

            // Create new user with RESTAURANT_OWNER role
            const hashedPassword = await bcrypt.hash(ownerPassword, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: ownerEmail,
                    name: ownerName,
                    phone: ownerPhone,
                    password: hashedPassword,
                    role: 'RESTAURANT_OWNER'
                }
            });

            userId = newUser.id;
        }

        // Create restaurant with PENDING status
        const restaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                description,
                cuisineType,
                dietaryOptions,
                deliveryTime: deliveryTime || '30-45 min',
                imageUrl,
                ownerId: userId,
                status: 'PENDING', // Awaiting admin approval
                isOpen: false // Closed until approved
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Restaurant application submitted successfully! Awaiting admin approval.',
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                status: restaurant.status
            }
        });

    } catch (error: any) {
        console.error('Restaurant registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register restaurant', details: error.message },
            { status: 500 }
        );
    }
}
