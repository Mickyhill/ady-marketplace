// Removes the 5 temporary test accounts created by create-test-users.js,
// before handing the platform over to AKSU for real launch.
//
// This ANONYMIZES rather than hard-deletes — the same approach as the
// self-service account deletion feature (see users.routes.js DELETE /me).
// Hard-deleting would fail if a tester created any listings, messages,
// reviews, or transactions during testing, since those rows reference the
// user and aren't set up to cascade-delete. Anonymizing keeps referential
// integrity intact while removing all personal/test data.
//
// Run: node prisma/remove-test-users.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const TESTER_EMAILS = [1, 2, 3, 4, 5].map((n) => `tester${n}@adymarketplace.test`);

async function main() {
  for (const email of TESTER_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`Not found, skipping: ${email}`);
      continue;
    }

    const unusablePasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: "Deleted User",
        email: `deleted-test-${user.id}@adymarketplace.invalid`,
        phone: null,
        department: null,
        faculty: null,
        matricNumber: null,
        studentPortalScreenshotUrl: null,
        avatarUrl: null,
        bio: null,
        passwordHash: unusablePasswordHash,
        phoneVerified: false,
        identityVerified: false,
        verificationStatus: "UNVERIFIED",
        deletedAt: new Date(),
      },
    });

    // Also pull any listings they made off the market, same as real
    // self-service account deletion does.
    await prisma.listing.updateMany({
      where: { sellerId: user.id, status: "ACTIVE" },
      data: { status: "REMOVED" },
    });

    console.log(`Removed: ${email}`);
  }
  console.log("\nAll test accounts removed. Safe to hand over for real launch.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
