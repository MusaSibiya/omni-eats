import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating Unique Login Details for each Restaurant...');

  const password = await bcrypt.hash('password123', 10);

  const owners = [
    { name: "Braai Master", email: "braai@omni.com", restaurantName: "The Biltong & Braai Hub" },
    { name: "Spice Chef", email: "spice@omni.com", restaurantName: "Cape Malay Spice House" },
    { name: "Sea Breeze Manager", email: "sea@omni.com", restaurantName: "Durban Sea Breeze" },
    { name: "Veggie Chef", email: "veggie@omni.com", restaurantName: "Vibrant Veggie Vine" },
    { name: "Pizza King", email: "pizza@omni.com", restaurantName: "Pretoria Pizza Palace" },
    { name: "Shisanyama Boss", email: "shisa@omni.com", restaurantName: "Soweto Shisanyama" },
    { name: "Steakhouse Owner", email: "steak@omni.com", restaurantName: "Stellenbosch Steakhouse" },
    { name: "Sushi Master", email: "sushi@omni.com", restaurantName: "East Coast Sushi Bar" },
    { name: "Kota King", email: "kota@omni.com", restaurantName: "Kimberley Kota Kitchen" },
    { name: "Bistro Chef", email: "bistro@omni.com", restaurantName: "Bloemfontein Bistro" },
    { name: "Peri-Peri King", email: "peri@omni.com", restaurantName: "Polokwane Peri-Peri" },
    { name: "Burger Boss", email: "burger@omni.com", restaurantName: "George Gourmet Burgers" },
    { name: "Noodle Master", email: "noodle@omni.com", restaurantName: "Nelspruit Noodle Bar" },
    { name: "Ribs & Wings Owner", email: "ribs@omni.com", restaurantName: "Rustenburg Ribs & Wings" }
  ];

  for (const ownerData of owners) {
    // 1. Create the unique owner user
    const user = await prisma.user.upsert({
      where: { email: ownerData.email },
      update: { role: 'RESTAURANT_OWNER' },
      create: {
        name: ownerData.name,
        email: ownerData.email,
        password: password,
        role: 'RESTAURANT_OWNER'
      }
    });

    // 2. Link the existing restaurant to this new owner
    await prisma.restaurant.updateMany({
      where: { name: ownerData.restaurantName },
      data: { ownerId: user.id }
    });

    console.log(`✅ ${ownerData.restaurantName} is now owned by ${ownerData.email}`);
  }

  console.log('🚀 All restaurants now have their own unique professional logins!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
