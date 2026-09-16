const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const NEW_PASSWORD = "ChangeThisNow123!"; // change this to whatever you actually want, then run the script

async function main() {
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
  const result = await prisma.user.update({
    where: { email: "admin@aksmarketplace.test" },
    data: { passwordHash },
  });
  console.log(`Password reset for ${result.email}. New password: ${NEW_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());