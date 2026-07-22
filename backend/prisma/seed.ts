import { PrismaClient, Role } from "@prisma/client";
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
        role: Role.ADMIN,
      },
      {
        name: "Sales",
        email: "sales@fundsroom.com",
        password,
        role: Role.SALES,
      },
      {
        name: "Warehouse",
        email: "warehouse@fundsroom.com",
        password,
        role: Role.WAREHOUSE,
      },
      {
        name: "Accounts",
        email: "accounts@fundsroom.com",
        password,
        role: Role.ACCOUNTS,
      },
    ],
  });

  console.log("Users seeded successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });