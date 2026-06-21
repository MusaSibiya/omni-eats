import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Approving all restaurants...');
  const result = await prisma.restaurant.updateMany({
    data: {
      status: 'APPROVED'
    }
  });
  console.log(`Updated ${result.count} restaurants to APPROVED!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
