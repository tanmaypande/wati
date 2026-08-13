const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function ensureSuperAdmin() {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!existing) {
      const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@platform.com').toLowerCase();
      const rawPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
      const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);

      const superAdmin = await prisma.user.create({
        data: {
          name: 'Platform Super Admin',
          email,
          password: passwordHash,
          role: 'SUPER_ADMIN',
          workspaceId: null,
          isActive: true,
        },
      });

      console.log('Successfully initialized default Platform SUPER_ADMIN:', superAdmin.email);
    }
  } catch (err) {
    console.error('Failed to ensure Super Admin account:', err.message);
  }
}

module.exports = ensureSuperAdmin;
