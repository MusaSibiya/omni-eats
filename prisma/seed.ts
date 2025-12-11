import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Clear all data
    console.log('Clearing existing data...');
    await prisma.review.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.restaurant.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    console.log('Creating users...');
    const user1 = await prisma.user.create({
        data: { email: 'user@example.com', name: 'John Doe', phone: '+27 82 123 4567', role: 'USER', password: hashedPassword }
    });

    const user2 = await prisma.user.create({
        data: { email: 'jane@example.com', name: 'Jane Smith', phone: '+27 83 987 6543', role: 'USER', password: hashedPassword }
    });

    const admin = await prisma.user.create({
        data: { email: 'admin@omni.com', name: 'Admin User', phone: '+27 81 555 0000', role: 'ADMIN', password: hashedPassword }
    });

    // Restaurant 1: The Golden Plate
    console.log('Creating restaurants and menu items...');
    const restaurant1 = await prisma.restaurant.create({
        data: {
            name: 'The Golden Plate',
            description: 'Modern European fine dining with a focus on seasonal ingredients.',
            rating: 4.9,
            deliveryTime: '20-30 min',
            cuisineType: 'European',
            dietaryOptions: 'Vegetarian, Gluten-free'
        }
    });

    // Restaurant 1 Menu Items
    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant1.id, name: 'Wagyu Beef Carpaccio', description: 'Thinly sliced raw beef, capers, truffle oil', price: 24.00, category: 'Starters' },
            { restaurantId: restaurant1.id, name: 'Burrata Salad', description: 'Fresh burrata, heirloom tomatoes, basil, balsamic', price: 18.00, category: 'Starters' },
            { restaurantId: restaurant1.id, name: 'French Onion Soup', description: 'Caramelized onions, gruyere crust', price: 14.00, category: 'Starters' },
            { restaurantId: restaurant1.id, name: 'Truffle Risotto', description: 'Arborio rice, black truffle, parmesan', price: 32.00, category: 'Mains' },
            { restaurantId: restaurant1.id, name: 'Grilled Salmon', description: 'Atlantic salmon, lemon butter, seasonal vegetables', price: 28.00, category: 'Mains' },
            { restaurantId: restaurant1.id, name: 'Duck Confit', description: 'Slow-cooked duck leg, crispy skin, orange glaze', price: 34.00, category: 'Mains' },
            { restaurantId: restaurant1.id, name: 'Lamb Rack', description: 'Herb-crusted rack of lamb, rosemary jus', price: 42.00, category: 'Mains' },
            { restaurantId: restaurant1.id, name: 'Wild Mushroom Pasta', description: 'Fresh pasta, forest mushrooms, truffle cream', price: 26.00, category: 'Mains' },
            { restaurantId: restaurant1.id, name: 'Chocolate Fondant', description: 'Molten center, vanilla bean ice cream', price: 16.00, category: 'Desserts' },
            { restaurantId: restaurant1.id, name: 'Crème Brûlée', description: 'Vanilla custard, caramelized sugar crust', price: 14.00, category: 'Desserts' },
            { restaurantId: restaurant1.id, name: 'Tiramisu', description: 'Classic Italian coffee-soaked dessert', price: 12.00, category: 'Desserts' },
        ]
    });

    // Restaurant 2: Sakura Sushi
    const restaurant2 = await prisma.restaurant.create({
        data: {
            name: 'Sakura Sushi',
            description: 'Authentic Japanese Omakase experience at home.',
            rating: 4.8,
            deliveryTime: '30-45 min',
            cuisineType: 'Japanese',
            dietaryOptions: 'Gluten-free available'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant2.id, name: 'Edamame', description: 'Steamed soybeans, sea salt', price: 6.00, category: 'Starters' },
            { restaurantId: restaurant2.id, name: 'Spicy Tuna Roll', description: 'Fresh tuna, spicy mayo, cucumber', price: 12.00, category: 'Starters' },
            { restaurantId: restaurant2.id, name: 'Salmon Sashimi', description: 'Fresh Norwegian salmon, 8 pieces', price: 18.00, category: 'Starters' },
            { restaurantId: restaurant2.id, name: 'Gyoza', description: 'Pan-fried pork dumplings, 6 pieces', price: 10.00, category: 'Starters' },
            { restaurantId: restaurant2.id, name: 'Omakase Platter', description: 'Chef selected 12 piece nigiri', price: 45.00, category: 'Mains' },
            { restaurantId: restaurant2.id, name: 'Dragon Roll', description: 'Shrimp tempura, avocado, eel sauce', price: 16.00, category: 'Mains' },
            { restaurantId: restaurant2.id, name: 'ChickenTeriyaki', description: 'Grilled chicken, teriyaki glaze, steamed rice', price: 22.00, category: 'Mains' },
            { restaurantId: restaurant2.id, name: 'Ramen Bowl', description: 'Rich pork broth, noodles, soft-boiled egg', price: 18.00, category: 'Mains' },
            { restaurantId: restaurant2.id, name: 'Salmon Poke Bowl', description: 'Fresh salmon, avocado, rice, sesame', price: 20.00, category: 'Mains' },
            { restaurantId: restaurant2.id, name: 'Mochi Ice Cream', description: 'Assorted flavors, 4 pieces', price: 10.00, category: 'Desserts' },
            { restaurantId: restaurant2.id, name: 'Matcha Cheesecake', description: 'Green tea cheesecake, red bean', price: 12.00, category: 'Desserts' },
        ]
    });

    // Restaurant 3: Burger & Co.
    const restaurant3 = await prisma.restaurant.create({
        data: {
            name: 'Burger & Co.',
            description: 'Gourmet burgers made with organic grass-fed beef.',
            rating: 4.7,
            deliveryTime: '15-25 min',
            cuisineType: 'American',
            dietaryOptions: 'Vegetarian, Vegan options'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant3.id, name: 'Sweet Potato Fries', description: 'Crispy fries with garlic aioli', price: 8.00, category: 'Starters' },
            { restaurantId: restaurant3.id, name: 'Onion Rings', description: 'Beer-battered, served with ranch', price: 7.00, category: 'Starters' },
            { restaurantId: restaurant3.id, name: 'Buffalo Wings', description: 'Spicy wings, blue cheese dip, 8 pieces', price: 14.00, category: 'Starters' },
            { restaurantId: restaurant3.id, name: 'Loaded Nachos', description: 'Cheese, jalapeños, sour cream, guacamole', price: 12.00, category: 'Starters' },
            { restaurantId: restaurant3.id, name: 'The Classic', description: 'Cheddar, lettuce, tomato, house sauce', price: 18.00, category: 'Mains' },
            { restaurantId: restaurant3.id, name: 'Truffle Burger', description: 'Brie, truffle mayo, caramelized onions', price: 22.00, category: 'Mains' },
            { restaurantId: restaurant3.id, name: 'BBQ Bacon Burger', description: 'Crispy bacon, BBQ sauce, cheddar, onion rings', price: 20.00, category: 'Mains' },
            { restaurantId: restaurant3.id, name: 'Veggie Burger', description: 'House-made patty, avocado, sprouts', price: 16.00, category: 'Mains' },
            { restaurantId: restaurant3.id, name: 'Chicken Burger', description: 'Crispy chicken, coleslaw, spicy mayo', price: 17.00, category: 'Mains' },
            { restaurantId: restaurant3.id, name: 'Milkshake', description: 'Vanilla, chocolate, or strawberry', price: 7.00, category: 'Desserts' },
            { restaurantId: restaurant3.id, name: 'Brownie Sundae', description: 'Warm brownie, ice cream, hot fudge', price: 10.00, category: 'Desserts' },
            { restaurantId: restaurant3.id, name: 'Apple Pie', description: 'Classic American pie, vanilla ice cream', price: 9.00, category: 'Desserts' },
        ]
    });

    // Restaurant 4: Mzansi Flavors
    const restaurant4 = await prisma.restaurant.create({
        data: {
            name: 'Mzansi Flavors',
            description: 'Authentic South African cuisine with a modern twist.',
            rating: 4.6,
            deliveryTime: '25-35 min',
            cuisineType: 'South African',
            dietaryOptions: 'Halal, Gluten-free'
        }
    });

    await prisma.menuItem.createMany({
        data: [
            { restaurantId: restaurant4.id, name: 'Samoosas', description: 'Vegetable or beef, 6 pieces', price: 9.00, category: 'Starters' },
            { restaurantId: restaurant4.id, name: 'Chicken Livers', description: 'Peri-peri chicken livers, Portuguese roll', price: 12.00, category: 'Starters' },
            { restaurantId: restaurant4.id, name: 'Biltong Platter', description: 'Assorted biltong and droewors', price: 15.00, category: 'Starters' },
            { restaurantId: restaurant4.id, name: 'Bunny Chow', description: 'Durban curry in bread loaf', price: 20.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Bobotie', description: 'Spiced mince with egg topping, yellow rice', price: 22.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Boerewors Roll', description: 'Traditional sausage, tomato relish, pap', price: 16.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Peri-Peri Chicken', description: 'Flame-grilled half chicken, Portuguese style', price: 25.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Potjiekos', description: 'Slow-cooked stew, vegetables, rice', price: 24.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Gatsby', description: 'Loaded sub with chips, sauces, meat', price: 18.00, category: 'Mains' },
            { restaurantId: restaurant4.id, name: 'Malva Pudding', description: 'Traditional sweet sponge, custard', price: 12.00, category: 'Desserts' },
            { restaurantId: restaurant4.id, name: 'Koeksisters', description: 'Syrupy twisted doughnuts, 4 pieces', price: 8.00, category: 'Desserts' },
            { restaurantId: restaurant4.id, name: 'Milk Tart', description: 'Classic South African custard tart', price: 10.00, category: 'Desserts' },
        ]
    });

    console.log('✅ Created restaurants and menu items');

    // Create Addresses
    await prisma.address.createMany({
        data: [
            { userId: user1.id, label: 'Home', street: '123 Main Street', city: 'Johannesburg', province: 'Gauteng', postalCode: '2001', isDefault: true },
            { userId: user1.id, label: 'Work', street: '456 Business Ave', city: 'Sandton', province: 'Gauteng', postalCode: '2196', isDefault: false },
            { userId: user2.id, label: 'Home', street: '789 Park Road', city: 'Cape Town', province: 'Western Cape', postalCode: '8001', isDefault: true },
        ]
    });

    //  Reviews
    await prisma.review.createMany({
        data: [
            { userId: user1.id, restaurantId: restaurant1.id, rating: 5, comment: 'Absolutely amazing! The truffle risotto is to die for. Will definitely order again!' },
            { userId: user2.id, restaurantId: restaurant1.id, rating: 4, comment: 'Great food, but delivery took a bit longer than expected. Still worth it though!' },
            { userId: user1.id, restaurantId: restaurant2.id, rating: 5, comment: 'Best sushi I\'ve ever had delivered! Fresh and beautifully presented.' },
            { userId: user2.id, restaurantId: restaurant3.id, rating: 5, comment: 'The truffle burger is incredible. Perfect every time!' },
            { userId: user1.id, restaurantId: restaurant4.id, rating: 4, comment: 'Delicious authentic SA food. The bunny chow reminds me of home!' },
        ]
    });

    // Favorites
    await prisma.favorite.createMany({
        data: [
            { userId: user1.id, restaurantId: restaurant1.id },
            { userId: user1.id, restaurantId: restaurant2.id },
            { userId: user2.id, restaurantId: restaurant3.id },
            { userId: user2.id, restaurantId: restaurant4.id },
        ]
    });

    // Get some menu items for orders
    const allMenuItems = await prisma.menuItem.findMany({ take: 10 });

    // Create Orders
    await prisma.order.create({
        data: {
            userId: user1.id,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            total: 70.00,
            items: {
                create: [
                    { menuItemId: allMenuItems[0].id, quantity: 1, price: 32.00 },
                    { menuItemId: allMenuItems[1].id, quantity: 1, price: 24.00 },
                    { menuItemId: allMenuItems[2].id, quantity: 1, price: 14.00 },
                ]
            }
        }
    });

    await prisma.order.create({
        data: {
            userId: user1.id,
            status: 'COOKING',
            paymentStatus: 'PAID',
            total: 63.00,
            items: {
                create: [
                    { menuItemId: allMenuItems[4].id, quantity: 1, price: 45.00 },
                    { menuItemId: allMenuItems[5].id, quantity: 1, price: 18.00 },
                ]
            }
        }
    });

    await prisma.order.create({
        data: {
            userId: user1.id,
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            total: 40.00,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            items: {
                create: [
                    { menuItemId: allMenuItems[6].id, quantity: 1, price: 18.00 },
                    { menuItemId: allMenuItems[7].id, quantity: 1, price: 22.00 },
                ]
            }
        }
    });

    const totalMenuItems = await prisma.menuItem.count();

    console.log('\n✅ Database seeded successfully!');
    console.log(`   ├─ 3 users`);
    console.log(`   ├─ 4 restaurants`);
    console.log(`   ├─ ${totalMenuItems} menu items`);
    console.log(`   ├─ 3 addresses`);
    console.log(`   ├─ 5 reviews`);
    console.log(`   ├─ 4 favorites`);
    console.log(`   └─ 3 orders\n`);
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
