// Creates 5 temporary test accounts for external testers (people outside
// AKSU) to try the platform before real launch. These bypass the normal
// registration route entirely, so they skip matric-number-format validation
// and don't need a student portal screenshot — appropriate for QA testers
// who aren't real students.
//
// Run: node prisma/create-test-users.js
//
// IMPORTANT: run prisma/remove-test-users.js before handing this over to
// AKSU for real launch — these accounts should never remain live in a real
// production environment being used by actual students.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const TEST_PASSWORD = "AdyTester2026!";

const TESTERS = [1, 2, 3, 4, 5].map((n) => ({
  name: `Test User ${n}`,
  email: `tester${n}@adymarketplace.test`,
}));

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  for (const tester of TESTERS) {
    const existing = await prisma.user.findUnique({ where: { email: tester.email } });
    if (existing) {
      console.log(`Already exists, skipping: ${tester.email}`);
      continue;
    }
    await prisma.user.create({
      data: {
        name: tester.name,
        email: tester.email,
        passwordHash,
        role: "STUDENT",
        // Pre-verified so testers see the full experience (badges, boosts,
        // payments) without needing a real matric number or portal screenshot.
        verificationStatus: "VERIFIED",
        phoneVerified: true,
        identityVerified: true,
      },
    });
    console.log(`Created: ${tester.email}`);
  }

  console.log("\nShare these credentials with your 5 testers:");
  console.log(`  Password (same for all): ${TEST_PASSWORD}`);
  TESTERS.forEach((t) => console.log(`  ${t.email}`));
  console.log("\nRemember to run remove-test-users.js before real launch.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
