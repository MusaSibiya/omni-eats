import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🍽️ Creating 4 Premium South African Restaurants...');

  // 1. Get the admin user to be the owner
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@omni.com' }
  });

  if (!admin) {
    console.error('Admin user not found. Please ensure the main seed has run.');
    return;
  }

  // 2. Data for 4 diverse restaurants
  const restaurants = [
    {
      name: "The Biltong & Braai Hub",
      description: "Authentic South African grill experience with premium cured meats and wood-fired steaks.",
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Braai",
      rating: 4.8,
      deliveryTime: "25-35 min",
      address: "123 Sandton Drive, Johannesburg",
      menuItems: [
        { name: "Signature Wagyu Boerewors", description: "Juicy, spiced traditional sausage served with pap and chakalaka.", price: 145.00, category: "Mains" },
        { name: "Karoo Lamb Chops", description: "300g flame-grilled chops with rosemary and garlic.", price: 210.00, category: "Mains" },
        { name: "Dry-Wors Platter", description: "Assorted premium biltong and dry-wors with chili bites.", price: 120.00, category: "Sides" },
        { name: "Malva Pudding", description: "Warm apricot sponge with creamy custard.", price: 65.00, category: "Desserts" }
      ]
    },
    {
      name: "Cape Malay Spice House",
      description: "Traditional aromatic curries and flavorful dishes from the heart of Bo-Kaap.",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Curry",
      rating: 4.6,
      deliveryTime: "30-45 min",
      address: "45 Wale Street, Cape Town",
      menuItems: [
        { name: "Butter Chicken Curry", description: "Mild, creamy tomato-based curry served with basmati rice.", price: 135.00, category: "Mains" },
        { name: "Bobotie with Yellow Rice", description: "Spiced minced meat bake with egg-based topping and raisins.", price: 155.00, category: "Mains" },
        { name: "Dhal Puri & Samoosas", description: "Set of 4 spicy beef and potato samoosas.", price: 55.00, category: "Starters" },
        { name: "Koesisters", description: "Traditional Cape Malay donuts coated in coconut.", price: 45.00, category: "Desserts" }
      ]
    },
    {
      name: "Durban Sea Breeze",
      description: "The best seafood and bunny chows on the coast, using fresh local catch.",
      imageUrl: "https://images.unsplash.com/photo-1551731359-2b34fc5d0d2a?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Seafood",
      rating: 4.7,
      deliveryTime: "20-30 min",
      address: "88 Marine Parade, Durban",
      menuItems: [
        { name: "Mutton Bunny Chow", description: "Half-loaf hollowed out and filled with spicy mutton curry.", price: 115.00, category: "Mains" },
        { name: "Grilled Tiger Prawns", description: "6 large prawns served with lemon butter and peri-peri sauce.", price: 245.00, category: "Mains" },
        { name: "Calamari Rings", description: "Crispy fried calamari with tartar sauce.", price: 85.00, category: "Starters" },
        { name: "Stoney Ginger Beer", description: "Extra spicy local favorite.", price: 25.00, category: "Drinks" }
      ]
    },
    {
      name: "Vibrant Veggie Vine",
      description: "Gourmet plant-based bowls and healthy wraps inspired by local garden produce.",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Vegetarian",
      rating: 4.5,
      deliveryTime: "15-25 min",
      address: "12 Greenway, Greenside, JHB",
      menuItems: [
        { name: "Roasted Pumpkin Harvest Bowl", description: "Quinoa, kale, roasted pumpkin, and seeds with tahini dressing.", price: 125.00, category: "Bowls" },
        { name: "Chickpea & Spinach Roti Wrap", description: "Spiced chickpeas wrapped in a fresh handmade roti.", price: 95.00, category: "Wraps" },
        { name: "Sweet Potato Fries", description: "Hand-cut and double-fried with sea salt.", price: 45.00, category: "Sides" },
        { name: "Fresh Berry Smoothie", description: "Mixed berries, banana, and almond milk.", price: 55.00, category: "Drinks" }
      ]
    }
  ];

  // 3. Create them in the database
  for (const r of restaurants) {
    const createdRestaurant = await prisma.restaurant.create({
      data: {
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        cuisineType: r.cuisineType,
        rating: r.rating,
        deliveryTime: r.deliveryTime,
        address: r.address,
        ownerId: admin.id,
        status: "ACTIVE",
        menuItems: {
          create: r.menuItems
        }
      }
    });
    console.log(`✅ Created ${r.name} with ${r.menuItems.length} menu items.`);
  }

  console.log('🚀 All 4 restaurants are live on Omni Eats!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
