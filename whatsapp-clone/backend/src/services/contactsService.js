const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

async function createContact({ workspaceId, name, phone, email, profileImage }) {
  try {
    const contact = await prisma.contact.create({
      data: { workspaceId, name, phone, email: email || null, profileImage: profileImage || null },
    });
    return contact;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error('Phone already registered in this workspace');
    }
    throw err;
  }
}

async function updateContact({ id, workspaceId, name, phone, email, profileImage }) {
  try {
    const existing = await prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing || existing.workspaceId !== workspaceId) {
      const e = new Error('Contact not found');
      e.status = 404;
      throw e;
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { name, phone, email: email || null, profileImage: profileImage || null },
    });
    return updated;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error('Phone already registered in this workspace');
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const e = new Error('Contact not found');
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

async function deleteContact({ id, workspaceId }) {
  try {
    const existing = await prisma.contact.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing || existing.workspaceId !== workspaceId) {
      const e = new Error('Contact not found');
      e.status = 404;
      throw e;
    }

    await prisma.contact.delete({ where: { id } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const e = new Error('Contact not found');
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

async function getContact({ id, workspaceId }) {
  const contact = await prisma.contact.findFirst({
    where: { id, workspaceId },
    include: {
      conversations: {
        select: { id: true, status: true, assignedToId: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!contact) {
    const e = new Error('Contact not found');
    e.status = 404;
    throw e;
  }

  return contact;
}

async function searchContacts({ workspaceId, q, page = 1, limit = 20 }) {
  const baseWhere = { workspaceId };
  const where = q
    ? {
        AND: [
          baseWhere,
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      }
    : baseWhere;

  const take = Math.min(Number(limit) || 20, 200);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [total, items] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
  ]);

  return { total, page: Number(page), limit: take, items };
}

module.exports = {
  createContact,
  updateContact,
  deleteContact,
  getContact,
  searchContacts,
};
