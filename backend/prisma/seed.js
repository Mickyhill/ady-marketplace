const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Furniture", icon: "sofa" },
  { name: "Electronics", icon: "cpu" },
  { name: "Books", icon: "book" },
  { name: "Fashion", icon: "shirt" },
  { name: "Kitchen", icon: "utensils" },
  { name: "Hostel", icon: "home" },
  { name: "Vehicles", icon: "bike" },
  { name: "Services", icon: "wrench" },
];

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const adminEmail = "admin@adymarketplace.test";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
    await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        verificationStatus: "VERIFIED",
      },
    });
    console.log(`Seeded admin user: ${adminEmail} / ChangeMe123! (change this immediately)`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
