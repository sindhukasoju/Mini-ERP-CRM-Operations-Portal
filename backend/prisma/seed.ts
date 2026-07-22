import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@fundsroom.com",
        password,
        role: "ADMIN",
      },
      {
        name: "Sales",
        email: "sales@fundsroom.com",
        password,
        role: "SALES",
      },
      {
        name: "Warehouse",
        email: "warehouse@fundsroom.com",
        password,
        role: "WAREHOUSE",
      },
      {
        name: "Accounts",
        email: "accounts@fundsroom.com",
        password,
        role: "ACCOUNTS",
      },
    ],
  });

  console.log("Users seeded successfully");
}
//Added proper logic
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
//   Email: admin@fundsroom.com
// Password: password123