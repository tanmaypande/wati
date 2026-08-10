const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

async function listTemplates() {
  return prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function getTemplate({ id }) {
  const template = await prisma.template.findUnique({ where: { id } });

  if (!template) {
    const err = new Error('Template not found');
    err.status = 404;
    throw err;
  }

  return template;
}

async function createTemplate({ name, category, body, status, language }) {
  return prisma.template.create({
    data: {
      name: name || 'Untitled template',
      category: category || 'Marketing',
      body: body || '',
      status: status || 'PENDING',
      language: language || 'English',
    },
  });
}

async function updateTemplate({ id, name, category, body, status, language }) {
  try {
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

async function deleteTemplate({ id }) {
  try {
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
