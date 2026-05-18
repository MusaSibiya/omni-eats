import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  let out = '';
  orders.forEach(o => {
      out += `Order ${o.id}: Total DB=${o.total}\n`;
      o.items.forEach(i => out += (`  Item ${i.id}: Qty ${i.quantity} @ R${i.price}\n`));
  });
  fs.writeFileSync('out_utf8.txt', out, 'utf-8');
}

main().catch(console.error).finally(() => prisma.$disconnect());
