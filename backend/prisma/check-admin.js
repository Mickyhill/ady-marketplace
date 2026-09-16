const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true, createdAt: true },
  });
  console.log("Admin accounts found:");
  admins.forEach((a) => console.log(`  ${a.email} (${a.name}) - created ${a.createdAt}`));
  if (admins.length === 0) console.log("  None found!");
}

main().finally(() => prisma.$disconnect());