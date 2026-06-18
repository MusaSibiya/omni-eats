import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with SA Flavors...');

    // Clear all data
    console.log('Clearing existing data...');
    // Delete in order to respect foreign key constraints
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create Users
    console.log('Creating users...');
    const user1 = await prisma.user.create({
        data: { email: 'user@example.com', name: 'Thabo Mbeki', phone: '+27 82 123 4567', role: 'USER', password: hashedPassword }
    });

    const admin = await prisma.user.create({
        data: { email: 'admin@omni.com', name: 'Omni Admin', phone: '+27 81 555 0000', role: 'ADMIN', password: adminPassword }
    });

    // Create Restaurant Owners
    const sowetoOwner = await prisma.user.create({
        data: { email: 'soweto@example.com', name: 'Soweto Gold Owner', phone: '+27 83 111 2222', role: 'USER', password: hashedPassword }
    });

    const maxsOwner = await prisma.user.create({
        data: { email: 'maxs@example.com', name: 'Max\'s Lifestyle Owner', phone: '+27 83 333 4444', role: 'USER', password: hashedPassword }
    });

    const durbanOwner = await prisma.user.create({
        data: { email: 'durban@example.com', name: 'Durban Curry House Owner', phone: '+27 83 555 6666', role: 'USER', password: hashedPassword }
    });

    const kotaOwner = await prisma.user.create({
        data: { email: 'kota@example.com', name: 'The Kota Joint Owner', phone: '+27 83 777 8888', role: 'USER', password: hashedPassword }
    });

    // Create a Driver User
    const driver = await prisma.user.create({
        data: { email: 'driver@example.com', name: 'Sipho the Driver', phone: '+27 84 111 2222', role: 'DRIVER', password: hashedPassword }
    });

    // Restaurant 1: Soweto Gold
    console.log('Creating restaurants and menu items...');
    const restaurant1 = await prisma.restaurant.create({
        data: {
            name: 'Soweto Gold',
            description: 'The authentic taste of Vilakazi Street. Famous for our Kotas and Mogodu.',
            rating: 4.8,
            deliveryTime: '30-45 min',
            cuisineType: 'Kasi / Traditional',
            dietaryOptions: 'Halal friendly',
            imageUrl: '/images/turkey-bowl.png',
            ownerId: sowetoOwner.id,
            status: 'APPROVED'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant1.id, name: 'Full House Kota', description: 'Bread, polony, russian, cheese, egg, atchar, chips.', price: 45.00, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80' },
            { restaurantId: restaurant1.id, name: 'Mogodu & Pap', description: 'Slow cooked tripe served with creamy pap.', price: 65.00, category: 'Main' },
            { restaurantId: restaurant1.id, name: 'Hardbody Chicken', description: 'Traditional hardbody chicken stew with dumplings.', price: 85.00, category: 'Main' },
            { restaurantId: restaurant1.id, name: 'Chakalaka', description: 'Spicy vegetable relish.', price: 15.00, category: 'Sides' },
        ]
    });

    // Restaurant 2: Max\'s Lifestyle
    const restaurant2 = await prisma.restaurant.create({
        data: {
            name: 'Max\'s Lifestyle',
            description: 'Premium Shisa Nyama experience. Grilled meat and good vibes.',
            rating: 4.9,
            deliveryTime: '40-50 min',
            cuisineType: 'Shisa Nyama',
            dietaryOptions: 'Meat lovers',
            imageUrl: '/images/hero-salmon.png',
            ownerId: maxsOwner.id,
            status: 'APPROVED'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant2.id, name: 'Shisa Nyama Platter', description: 'Wors, chops, brisket, wings served with salsa and pap.', price: 250.00, category: 'Platters' },
            { restaurantId: restaurant2.id, name: 'Braai Sample', description: 'Tasting portion of our best grilled meats.', price: 120.00, category: 'Main' },
            { restaurantId: restaurant2.id, name: 'Grilled Corn', description: 'Charred corn on the cob with butter.', price: 20.00, category: 'Sides' },
            { restaurantId: restaurant2.id, name: 'Savannah Dry', description: 'Cold cider (Non-alcoholic version available).', price: 35.00, category: 'Drinks' },
        ]
    });

    // Restaurant 3: Durban Curry House
    const restaurant3 = await prisma.restaurant.create({
        data: {
            name: 'Durban Curry House',
            description: 'Spicy, flavorful, and filling. Home of the Bunny Chow.',
            rating: 4.7,
            deliveryTime: '25-35 min',
            cuisineType: 'Indian / Durban',
            dietaryOptions: 'Vegetarian, Halal',
            imageUrl: '/images/tomato-chicken.png',
            ownerId: durbanOwner.id,
            status: 'APPROVED'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant3.id, name: 'Mutton Bunny Chow', description: 'Quarter loaf filled with spicy mutton curry.', price: 95.00, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1585238342707-1c1cc8f98ec5?auto=format&fit=crop&w=800&q=80' },
            { restaurantId: restaurant3.id, name: 'Beans Bunny (Veg)', description: 'Quarter loaf with sugar beans curry.', price: 55.00, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
            { restaurantId: restaurant3.id, name: 'Samoosa Basket', description: 'Mix of mince, potato, and cheese corn samoosas.', price: 40.00, category: 'Starters' },
            { restaurantId: restaurant3.id, name: 'Biryani', description: 'Fragrant rice dish with chicken and spices.', price: 85.00, category: 'Main' },
        ]
    });

    // Restaurant 4: The Kota Joint
    const restaurant4 = await prisma.restaurant.create({
        data: {
            name: 'The Kota Joint',
            description: 'Modern twist on the classic Spatlo. Loads of cheese and sauces.',
            rating: 4.5,
            deliveryTime: '20-30 min',
            cuisineType: 'Fast Food',
            dietaryOptions: 'Cheese only',
            imageUrl: '/images/jalapeno-popper.png',
            ownerId: kotaOwner.id,
            status: 'APPROVED'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant4.id, name: 'Cheese Overload', description: 'Standard kota with triple cheese sauce.', price: 50.00, category: 'Main' },
            { restaurantId: restaurant4.id, name: 'Budget Kota', description: 'Chips, polony, and atchar.', price: 25.00, category: 'Main' },
            { restaurantId: restaurant4.id, name: 'Prego Roll', description: 'Steak roll with spicy prego sauce.', price: 60.00, category: 'Main' },
        ]
    });


    console.log('\n✅ Database seeded successfully with SA Content!');
    console.log(`   Admin User:      admin@omni.com / admin123`);
    console.log(`   Test User:       user@example.com / password123`);
    console.log(`   Soweto Gold:     soweto@example.com / password123`);
    console.log(`   Max's Lifestyle: maxs@example.com / password123`);
    console.log(`   Durban Curry:    durban@example.com / password123`);
    console.log(`   The Kota Joint:  kota@example.com / password123`);
    console.log(`   Driver:          driver@example.com / password123`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
