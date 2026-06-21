import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🍽️ Creating 14 Premium South African Restaurants...');

  // 1. Get the admin user to be the owner
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@omni.com' }
  });

  if (!admin) {
    console.error('Admin user not found. Please ensure the main seed has run.');
    return;
  }

  // 2. Data for 14 diverse restaurants
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
    },
    {
      name: "Pretoria Pizza Palace",
      description: "Wood-fired pizzas with authentic Italian toppings and a South African twist.",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Pizza",
      rating: 4.4,
      deliveryTime: "30-40 min",
      address: "78 Church Street, Pretoria",
      menuItems: [
        { name: "Margherita Pizza", description: "Classic tomato, mozzarella, and fresh basil.", price: 110.00, category: "Pizzas" },
        { name: "Pepperoni Deluxe", description: "Spicy pepperoni, extra cheese, and oregano.", price: 135.00, category: "Pizzas" },
        { name: "Garlic Bread", description: "Crispy garlic bread with melted butter.", price: 40.00, category: "Sides" },
        { name: "Tiramisu", description: "Classic Italian dessert with coffee and mascarpone.", price: 75.00, category: "Desserts" }
      ]
    },
    {
      name: "Soweto Shisanyama",
      description: "Authentic township shisanyama experience with grilled meat and traditional sides.",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
      cuisineType: "South African",
      rating: 4.9,
      deliveryTime: "35-45 min",
      address: "25 Vilakazi Street, Soweto",
      menuItems: [
        { name: "Shisanyama Platter", description: "Grilled beef, chicken, and boerewors with pap and chakalaka.", price: 185.00, category: "Platters" },
        { name: "Chicken Livers", description: "Spicy peri-peri chicken livers with toast.", price: 75.00, category: "Starters" },
        { name: "Mieliepap", description: "Traditional maize meal.", price: 30.00, category: "Sides" },
        { name: "Amarula Don Pedro", description: "Creamy dessert with Amarula liqueur.", price: 85.00, category: "Desserts" }
      ]
    },
    {
      name: "Stellenbosch Steakhouse",
      description: "Premium steaks and fine dining in the heart of the Cape Winelands.",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Steakhouse",
      rating: 4.8,
      deliveryTime: "40-50 min",
      address: "12 Dorp Street, Stellenbosch",
      menuItems: [
        { name: "Ribeye Steak", description: "300g aged ribeye with mushroom sauce.", price: 265.00, category: "Steaks" },
        { name: "Creamed Spinach", description: "Rich creamed spinach.", price: 45.00, category: "Sides" },
        { name: "Onion Rings", description: "Crispy beer-battered onion rings.", price: 40.00, category: "Sides" },
        { name: "Chocolate Brownie", description: "Warm chocolate brownie with vanilla ice cream.", price: 70.00, category: "Desserts" }
      ]
    },
    {
      name: "East Coast Sushi Bar",
      description: "Fresh sushi and Japanese cuisine with a modern twist.",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Japanese",
      rating: 4.6,
      deliveryTime: "25-35 min",
      address: "45 Boardwalk Boulevard, Port Elizabeth",
      menuItems: [
        { name: "California Roll", description: "Crab, avocado, and cucumber.", price: 95.00, category: "Sushi" },
        { name: "Salmon Sashimi", description: "Fresh salmon sashimi (8 pieces).", price: 145.00, category: "Sashimi" },
        { name: "Edamame", description: "Steamed edamame with sea salt.", price: 35.00, category: "Starters" },
        { name: "Green Tea Ice Cream", description: "Traditional Japanese green tea ice cream.", price: 55.00, category: "Desserts" }
      ]
    },
    {
      name: "Kimberley Kota Kitchen",
      description: "Delicious kota sandwiches loaded with your favorite fillings.",
      imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Street Food",
      rating: 4.3,
      deliveryTime: "20-30 min",
      address: "67 Jones Street, Kimberley",
      menuItems: [
        { name: "Full House Kota", description: "Burger patty, cheese, chips, egg, and special sauce.", price: 85.00, category: "Kotas" },
        { name: "Veggie Kota", description: "Potato wedges, cheese, and veggie patty.", price: 70.00, category: "Kotas" },
        { name: "Cheese Chips", description: "Crispy chips with melted cheese.", price: 40.00, category: "Sides" },
        { name: "Milkshake", description: "Creamy milkshake in various flavors.", price: 35.00, category: "Drinks" }
      ]
    },
    {
      name: "Bloemfontein Bistro",
      description: "Cozy bistro serving French-inspired cuisine with local ingredients.",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
      cuisineType: "French",
      rating: 4.5,
      deliveryTime: "30-40 min",
      address: "89 President Brand Street, Bloemfontein",
      menuItems: [
        { name: "Coq au Vin", description: "Braised chicken in red wine sauce.", price: 175.00, category: "Mains" },
        { name: "French Onion Soup", description: "Caramelized onion soup with gruyère crouton.", price: 75.00, category: "Starters" },
        { name: "Pommes Frites", description: "Crispy French fries.", price: 35.00, category: "Sides" },
        { name: "Crème Brûlée", description: "Classic creamy dessert with caramelized sugar top.", price: 65.00, category: "Desserts" }
      ]
    },
    {
      name: "Polokwane Peri-Peri",
      description: "Flame-grilled peri-peri chicken with spicy sauces.",
      imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Portuguese",
      rating: 4.7,
      deliveryTime: "25-35 min",
      address: "34 Landdros Maré Street, Polokwane",
      menuItems: [
        { name: "Half Chicken", description: "Flame-grilled peri-peri chicken (half).", price: 95.00, category: "Chicken" },
        { name: "Whole Chicken", description: "Flame-grilled peri-peri chicken (whole).", price: 175.00, category: "Chicken" },
        { name: "Spicy Rice", description: "Peri-peri flavored rice.", price: 35.00, category: "Sides" },
        { name: "Coleslaw", description: "Creamy coleslaw.", price: 25.00, category: "Sides" }
      ]
    },
    {
      name: "George Gourmet Burgers",
      description: "Gourmet burgers with the freshest ingredients and unique combinations.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Burgers",
      rating: 4.4,
      deliveryTime: "20-30 min",
      address: "56 York Street, George",
      menuItems: [
        { name: "Classic Beef Burger", description: "Beef patty, cheese, lettuce, tomato, and special sauce.", price: 95.00, category: "Burgers" },
        { name: "BBQ Bacon Burger", description: "Beef patty, bacon, BBQ sauce, and onion rings.", price: 120.00, category: "Burgers" },
        { name: "Loaded Fries", description: "Fries with cheese, bacon, and jalapeños.", price: 55.00, category: "Sides" },
        { name: "Milk Tart Shake", description: "Creamy milkshake with milk tart flavor.", price: 45.00, category: "Drinks" }
      ]
    },
    {
      name: "Nelspruit Noodle Bar",
      description: "Delicious Asian noodles and stir-fries with fresh vegetables.",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
      cuisineType: "Asian",
      rating: 4.6,
      deliveryTime: "25-35 min",
      address: "78 Crocodile Street, Nelspruit",
      menuItems: [
        { name: "Beef Chow Mein", description: "Stir-fried noodles with beef and vegetables.", price: 115.00, category: "Noodles" },
        { name: "Sweet and Sour Chicken", description: "Crispy chicken in sweet and sour sauce.", price: 125.00, category: "Mains" },
        { name: "Spring Rolls", description: "Crispy vegetable spring rolls.", price: 45.00, category: "Starters" },
        { name: "Mango Sticky Rice", description: "Sweet sticky rice with fresh mango.", price: 60.00, category: "Desserts" }
      ]
    },
    {
      name: "Rustenburg Ribs & Wings",
      description: "Fall-off-the-bone ribs and crispy wings with various sauces.",
      imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
      cuisineType: "American",
      rating: 4.5,
      deliveryTime: "30-40 min",
      address: "12 Beyers Naudé Drive, Rustenburg",
      menuItems: [
        { name: "Full Rack Ribs", description: "Slow-cooked pork ribs with BBQ sauce.", price: 195.00, category: "Ribs" },
        { name: "Buffalo Wings", description: "Crispy chicken wings with buffalo sauce (12 pieces).", price: 115.00, category: "Wings" },
        { name: "Coleslaw", description: "Creamy coleslaw.", price: 25.00, category: "Sides" },
        { name: "Chocolate Milkshake", description: "Rich chocolate milkshake.", price: 40.00, category: "Drinks" }
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
        status: "APPROVED",
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
