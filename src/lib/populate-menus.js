const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- POPULATING MENUS ---');

    // 1. Rename restaurants
    await prisma.restaurant.update({
        where: { id: 'cmk6m1n6m0001v2ycq5ma6wgv' },
        data: { name: 'The Manchester Bistro', cuisineType: 'French/International' }
    });
    await prisma.restaurant.update({
        where: { id: 'cmkglqhjq0008v2uwv416sli1' },
        data: { name: 'Soweto Grill & Bar', cuisineType: 'South African Grill' }
    });
    await prisma.restaurant.update({
        where: { id: 'cmlhs0rgg000yv2wob883os5a' },
        data: { name: 'Manchester Royal Dining', cuisineType: 'Contemporary British' }
    });

    const menuItems = [
        // The Manchester Bistro
        {
            restaurantId: 'cmk6m1n6m0001v2ycq5ma6wgv',
            name: 'Beef Bourguignon',
            description: 'Slow-cooked beef in red wine sauce with pearl onions and mushrooms.',
            price: 245.00,
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1534939561122-0a1c9b8ea063?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmk6m1n6m0001v2ycq5ma6wgv',
            name: 'French Onion Soup',
            description: 'Classic caramalized onion soup topped with toasted baguette and gruyère.',
            price: 85.00,
            category: 'Starters',
            imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmk6m1n6m0001v2ycq5ma6wgv',
            name: 'Crème Brûlée',
            description: 'Rich custard base topped with a layer of hardened caramelized sugar.',
            price: 75.00,
            category: 'Dessert',
            imageUrl: 'https://images.unsplash.com/photo-1470333732907-3f2693d715ee?q=80&w=1000&auto=format&fit=crop'
        },

        // Soweto Grill & Bar
        {
            restaurantId: 'cmkglqhjq0008v2uwv416sli1',
            name: 'Shisa Nyama Platter',
            description: 'A selection of flame-grilled steak, boerewors, and chicken wings served with chakalaka.',
            price: 280.00,
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmkglqhjq0008v2uwv416sli1',
            name: 'Pap & Vleis',
            description: 'Traditional maize meal porridge served with a savory tomato and onion gravy and grilled beef.',
            price: 120.00,
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmkglqhjq0008v2uwv416sli1',
            name: 'Grilled Boerewors',
            description: 'Traditional South African sausage grilled to perfection.',
            price: 95.00,
            category: 'Starters',
            imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6e9b41724?q=80&w=1000&auto=format&fit=crop'
        },

        // Manchester Royal Dining
        {
            restaurantId: 'cmlhs0rgg000yv2wob883os5a',
            name: 'Pan-Seared Salmon',
            description: 'Fresh Atlantic salmon served with asparagus and lemon butter sauce.',
            price: 210.00,
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmlhs0rgg000yv2wob883os5a',
            name: 'Royal Garden Salad',
            description: 'Seasonal greens, heirloom tomatoes, and balsamic reduction.',
            price: 110.00,
            category: 'Starters',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop'
        },
        {
            restaurantId: 'cmlhs0rgg000yv2wob883os5a',
            name: 'Sticky Toffee Pudding',
            description: 'Classic British dessert served with vanilla bean ice cream.',
            price: 85.00,
            category: 'Dessert',
            imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    for (const item of menuItems) {
        await prisma.menuItem.create({
            data: item
        });
        console.log(`Added ${item.name} to restaurant ${item.restaurantId}`);
    }

    console.log('--- DONE ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
