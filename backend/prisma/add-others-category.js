const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.category.findUnique({ where: { name: "Others" } });
  if (existing) {
    console.log("Category 'Others' already exists — nothing to do.");
    return;
  }
  const category = await prisma.category.create({ data: { name: "Others" } });
  console.log(`Created category: ${category.name} (id: ${category.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());