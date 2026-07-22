require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'Admin User', email: 'admin@erp.com', role: 'ADMIN' },
    { name: 'Sales User', email: 'sales@erp.com', role: 'SALES' },
    { name: 'Warehouse User', email: 'warehouse@erp.com', role: 'WAREHOUSE' },
    { name: 'Accounts User', email: 'accounts@erp.com', role: 'ACCOUNTS' },
  ];

  for (const u of roles) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const password = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password,
          role: u.role,
        },
      });
      console.log(`Created ${u.role} user: ${u.email} / password123`);
    } else {
      console.log(`User ${u.email} already exists`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
