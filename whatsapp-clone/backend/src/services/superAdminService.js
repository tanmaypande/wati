const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const { isValidEmail, isValidPassword } = require('../utils/validation');
const { logAudit } = require('./auditLogService');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function getPlatformOverview() {
  const [
    totalCompanies,
    activeCompanies,
    suspendedCompanies,
    inactiveCompanies,
    totalUsers,
    totalAgents,
    totalContacts,
    totalConversations,
    recentCompanies,
  ] = await Promise.all([
    prisma.workspace.count(),
    prisma.workspace.count({ where: { status: 'ACTIVE' } }),
    prisma.workspace.count({ where: { status: 'SUSPENDED' } }),
    prisma.workspace.count({ where: { status: 'INACTIVE' } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'AGENT'] } } }),
    prisma.user.count({ where: { role: 'AGENT' } }),
    prisma.contact.count(),
    prisma.conversation.count(),
    prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { id: true, name: true, email: true },
          take: 1,
        },
        _count: {
          select: { users: true, contacts: true, conversations: true },
        },
      },
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    suspendedCompanies,
    inactiveCompanies,
    totalUsers,
    totalAgents,
    totalContacts,
    totalConversations,
    recentCompanies: recentCompanies.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      status: w.status,
      createdAt: w.createdAt,
      admin: w.users[0] || null,
      userCount: w._count.users,
      contactCount: w._count.contacts,
      conversationCount: w._count.conversations,
    })),
  };
}

async function listWorkspaces({ q = '', status = null, page = 1, limit = 20 } = {}) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const whereConditions = [];
  if (status) {
    whereConditions.push({ status });
  }
  if (q && q.trim()) {
    const term = q.trim();
    whereConditions.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { users: { some: { email: { contains: term, mode: 'insensitive' } } } },
      ],
    });
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [total, items] = await Promise.all([
    prisma.workspace.count({ where }),
    prisma.workspace.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        whatsappAccount: {
          select: { id: true, status: true, phoneNumberId: true },
        },
        _count: {
          select: {
            users: true,
            contacts: true,
            conversations: true,
            templates: true,
            broadcasts: true,
          },
        },
      },
    }),
  ]);

  const mapped = items.map((w) => {
    const adminUser = w.users.find((u) => u.role === 'ADMIN') || w.users[0] || null;
    const agentCount = w.users.filter((u) => u.role === 'AGENT').length;
    return {
      id: w.id,
      name: w.name,
      slug: w.slug,
      status: w.status,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      admin: adminUser,
      userCount: w._count.users,
      agentCount,
      contactCount: w._count.contacts,
      conversationCount: w._count.conversations,
      templateCount: w._count.templates,
      broadcastCount: w._count.broadcasts,
      whatsAppStatus: w.whatsappAccount?.status || 'NOT_CONFIGURED',
    };
  });

  return { total, page: Number(page), limit: take, items: mapped };
}

async function createCompany({ name, adminName, adminEmail, adminPassword, actorUserId }) {
  if (!name || !name.trim()) throw new Error('Company name is required');
  if (!adminName || !adminName.trim()) throw new Error('Admin name is required');
  if (!adminEmail || !adminEmail.trim()) throw new Error('Admin email is required');
  if (!adminPassword) throw new Error('Admin password is required');

  const normalizedEmail = adminEmail.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    const err = new Error('Please provide a valid email address.');
    err.status = 400;
    throw err;
  }

  if (!isValidPassword(adminPassword)) {
    const err = new Error('Admin password does not meet safety requirements.');
    err.status = 400;
    throw err;
  }

  // Check email uniqueness
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const err = new Error('Admin email is already registered to another user.');
    err.status = 409;
    throw err;
  }

  const slug = `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  // Transaction to create workspace and admin user atomically
  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: name.trim(),
        slug,
        status: 'ACTIVE',
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: adminName.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: 'ADMIN',
        workspaceId: workspace.id,
        isActive: true,
      },
    });

    // Create default WhatsApp account stub
    await tx.whatsAppAccount.create({
      data: {
        workspaceId: workspace.id,
        status: 'INACTIVE',
      },
    });

    return { workspace, adminUser };
  });

  if (actorUserId) {
    await logAudit({
      actorUserId,
      workspaceId: result.workspace.id,
      action: 'COMPANY_CREATED',
      targetType: 'Workspace',
      targetId: result.workspace.id,
      metadata: { companyName: name.trim(), adminEmail: normalizedEmail },
    });
  }

  return {
    workspace: result.workspace,
    admin: {
      id: result.adminUser.id,
      name: result.adminUser.name,
      email: result.adminUser.email,
      role: result.adminUser.role,
    },
  };
}

async function getWorkspaceDetail(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      whatsappAccount: true,
      _count: {
        select: {
          contacts: true,
          conversations: true,
          templates: true,
          broadcasts: true,
        },
      },
    },
  });

  if (!workspace) {
    const err = new Error('Workspace company not found');
    err.status = 404;
    throw err;
  }

  const admin = workspace.users.find((u) => u.role === 'ADMIN') || workspace.users[0] || null;
  const agents = workspace.users.filter((u) => u.role === 'AGENT');

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    status: workspace.status,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    admin,
    users: workspace.users,
    agentCount: agents.length,
    contactCount: workspace._count.contacts,
    conversationCount: workspace._count.conversations,
    templateCount: workspace._count.templates,
    broadcastCount: workspace._count.broadcasts,
    whatsappAccount: workspace.whatsappAccount || null,
  };
}

async function updateWorkspaceStatus({ workspaceId, status, actorUserId }) {
  const validStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid workspace status. Allowed: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!existing) {
    const err = new Error('Workspace not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { status },
  });

  if (actorUserId) {
    await logAudit({
      actorUserId,
      workspaceId,
      action: status === 'SUSPENDED' ? 'COMPANY_SUSPENDED' : 'COMPANY_ACTIVATED',
      targetType: 'Workspace',
      targetId: workspaceId,
      metadata: { previousStatus: existing.status, newStatus: status },
    });
  }

  return updated;
}

async function createWorkspaceAdmin({ workspaceId, name, email, password, actorUserId }) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    const err = new Error('Workspace not found');
    err.status = 404;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    const err = new Error('Valid email address required');
    err.status = 400;
    throw err;
  }

  if (!isValidPassword(password)) {
    const err = new Error('Password does not meet complexity requirements');
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const adminUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: 'ADMIN',
      workspaceId,
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, workspaceId: true, createdAt: true },
  });

  if (actorUserId) {
    await logAudit({
      actorUserId,
      workspaceId,
      action: 'ADMIN_CREATED',
      targetType: 'User',
      targetId: adminUser.id,
      metadata: { adminEmail: normalizedEmail },
    });
  }

  return adminUser;
}

async function listPlatformUsers({ q = '', role = null, workspaceId = null, page = 1, limit = 20 } = {}) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const whereConditions = [];
  if (role) whereConditions.push({ role });
  if (workspaceId) whereConditions.push({ workspaceId });
  if (q && q.trim()) {
    const term = q.trim();
    whereConditions.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          select: { id: true, name: true, status: true },
        },
      },
    }),
  ]);

  return { total, page: Number(page), limit: take, items };
}

async function toggleUserActive({ userId, isActive, actorUserId }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'SUPER_ADMIN') {
    const err = new Error('Cannot deactivate Super Admin accounts via user toggle');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: Boolean(isActive) },
    select: { id: true, name: true, email: true, role: true, isActive: true, workspaceId: true },
  });

  if (actorUserId) {
    await logAudit({
      actorUserId,
      workspaceId: user.workspaceId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: userId,
      metadata: { userEmail: user.email },
    });
  }

  return updated;
}

async function getSystemHealth() {
  const start = Date.now();
  let dbStatus = 'DISCONNECTED';
  let latencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'HEALTHY';
    latencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = 'ERROR';
  }

  return {
    status: dbStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
    database: { status: dbStatus, latencyMs },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
  };
}

module.exports = {
  getPlatformOverview,
  listWorkspaces,
  createCompany,
  getWorkspaceDetail,
  updateWorkspaceStatus,
  createWorkspaceAdmin,
  listPlatformUsers,
  toggleUserActive,
  getSystemHealth,
};
