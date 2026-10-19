import "dotenv/config";
import { prisma } from "./db";

async function main() {
  const categories = await prisma.category.findMany();

  console.log("Connected to Neon!");
  console.log("Categories:", categories);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });