const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING COMPREHENSIVE POPULATION ---');

    const restaurants = [
        {
            id: 'cmk6lk9g6000cv2r8no6lqjqm',
            name: 'Durban Curry House',
            imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000',
            menuItems: [
                { name: 'Lamb Bunny Chow', description: 'Half a loaf of bread filled with spicy lamb curry, a Durban classic.', price: 145.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000' },
                { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender boneless chicken.', price: 165.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=1000' },
                { name: 'Vegetable Samoosas', description: 'Cripy pastries filled with spiced vegetables (4 per portion).', price: 65.00, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1626509653293-41bb33373507?q=80&w=1000' },
                { name: 'Mango Lassi', description: 'Traditional yogurt-based drink blended with fresh mango.', price: 45.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000' },
                { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings soaked in cardamom sugar syrup.', price: 55.00, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1589113182023-7a7183e8785e?q=80&w=1000' }
            ]
        },
        {
            id: 'cmk6m1n6m0001v2ycq5ma6wgv',
            name: 'The Manchester Bistro',
            imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=2000',
            menuItems: [
                { name: 'Beef Bourguignon', description: 'Slow-cooked beef in red wine sauce with pearl onions and mushrooms.', price: 245.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1534939561122-0a1c9b8ea063?q=80&w=1000' },
                { name: 'French Onion Soup', description: 'Classic caramalized onion soup topped with toasted baguette and gruyère.', price: 85.00, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000' },
                { name: 'Crème Brûlée', description: 'Rich custard base topped with a layer of hardened caramelized sugar.', price: 75.00, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1470333732907-3f2693d715ee?q=80&w=1000' },
                { name: 'Steak Frites', description: 'Grilled sirloin served with crispy frites and herb butter.', price: 285.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1546241072-48010ad28abb?q=80&w=1000' },
                { name: 'Bordeaux Red Wine', description: 'A glass of premium French red wine.', price: 95.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000' }
            ]
        },
        {
            id: 'cmkglqhjq0008v2uwv416sli1',
            name: 'Soweto Grill & Bar',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000',
            menuItems: [
                { name: 'Shisa Nyama Platter', description: 'A selection of flame-grilled steak, boerewors, and chicken wings served with chakalaka.', price: 280.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000' },
                { name: 'Pap & Vleis', description: 'Traditional maize meal porridge served with a savory tomato and onion gravy and grilled beef.', price: 120.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000' },
                { name: 'Grilled Boerewors', description: 'Traditional South African sausage grilled to perfection.', price: 95.00, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1000' },
                { name: 'Amahewu', description: 'Traditional South African fermented maize drink.', price: 35.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1000' },
                { name: 'Malva Pudding', description: 'Sweet pudding with a spongy caramalized texture served with custard.', price: 65.00, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=1000' }
            ]
        },
        {
            id: 'cmlhs0rgg000yv2wob883os5a',
            name: 'Manchester Royal Dining',
            imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=2000',
            menuItems: [
                { name: 'Pan-Seared Salmon', description: 'Fresh Atlantic salmon served with asparagus and lemon butter sauce.', price: 210.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000' },
                { name: 'Royal Garden Salad', description: 'Seasonal greens, heirloom tomatoes, and balsamic reduction.', price: 110.00, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000' },
                { name: 'Sticky Toffee Pudding', description: 'Classic British dessert served with vanilla bean ice cream.', price: 85.00, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000' },
                { name: 'Roasted Venison', description: 'Premium venison loin with a berry reduction and root vegetables.', price: 320.00, category: 'Mains', imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=1000' },
                { name: 'English Afternoon Tea', description: 'Premium loose-leaf tea served in a porcelain pot.', price: 55.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000' }
            ]
        }
    ];

    for (const res of restaurants) {
        console.log(`Updating ${res.name}...`);

        // Update profile image
        await prisma.restaurant.update({
            where: { id: res.id },
            data: { imageUrl: res.imageUrl }
        });

        // 1. Find existing menu items to clean up dependencies
        const existingMenuItems = await prisma.menuItem.findMany({
            where: { restaurantId: res.id },
            select: { id: true }
        });
        const existingIds = existingMenuItems.map(m => m.id);

        // 2. Clear related OrderItems first
        if (existingIds.length > 0) {
            await prisma.orderItem.deleteMany({
                where: { menuItemId: { in: existingIds } }
            });
        }

        // 3. Clear existing menu items
        await prisma.menuItem.deleteMany({
            where: { restaurantId: res.id }
        });

        // 4. Add new items
        for (const item of res.menuItems) {
            await prisma.menuItem.create({
                data: {
                    ...item,
                    restaurantId: res.id
                }
            });
            console.log(`  Added ${item.name} (${item.category})`);
        }
    }

    console.log('--- POPULATION COMPLETE ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
