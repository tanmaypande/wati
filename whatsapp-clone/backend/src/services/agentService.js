const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const { isValidEmail, isValidPassword } = require('../utils/validation');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function createAgent({ workspaceId, name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    const err = new Error('Please enter a valid email address');
    err.status = 400;
    throw err;
  }

  if (!isValidPassword(password)) {
    const err = new Error('Password does not meet security requirements');
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const agent = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'AGENT',
      workspaceId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      workspaceId: true,
      createdAt: true,
    },
  });

  return agent;
}

async function listAgents({ workspaceId }) {
  return prisma.user.findMany({
    where: { workspaceId, role: 'AGENT' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function deleteAgent({ id, workspaceId }) {
  const existing = await prisma.user.findFirst({
    where: { id, workspaceId, role: 'AGENT' },
  });

  if (!existing) {
    const err = new Error('Agent not found in your workspace');
    err.status = 404;
    throw err;
  }

  // Unassign any conversations assigned to this agent before deleting
  await prisma.conversation.updateMany({
    where: { assignedToId: id, workspaceId },
    data: { assignedToId: null },
  });

  await prisma.user.delete({ where: { id } });
  return true;
}

module.exports = {
  createAgent,
  listAgents,
  deleteAgent,
};
