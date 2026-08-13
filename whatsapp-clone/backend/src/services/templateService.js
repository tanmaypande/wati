const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

async function listTemplates({ workspaceId }) {
  return prisma.template.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
}

async function getTemplate({ id, workspaceId }) {
  const template = await prisma.template.findFirst({ where: { id, workspaceId } });

  if (!template) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  return template;
}

async function createTemplate({ workspaceId, name, category, body, status, language }) {
  return prisma.template.create({
    data: {
      workspaceId,
      name: name || 'Untitled template',
      category: category || 'Marketing',
      body: body || '',
      status: status || 'PENDING',
      language: language || 'English',
    },
  });
}

async function updateTemplate({ id, workspaceId, name, category, body, status, language }) {
  try {
    const existing = await prisma.template.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing || existing.workspaceId !== workspaceId) {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }

    return await prisma.template.update({
      where: { id },
      data: {
        name: name || undefined,
        category: category || undefined,
        body: body || undefined,
        status: status || undefined,
        language: language || undefined,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }
}

async function deleteTemplate({ id, workspaceId }) {
  try {
    const existing = await prisma.template.findUnique({ where: { id }, select: { workspaceId: true } });
    if (!existing || existing.workspaceId !== workspaceId) {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }

    await prisma.template.delete({ where: { id } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }
}

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
