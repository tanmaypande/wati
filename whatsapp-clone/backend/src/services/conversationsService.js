const prisma = require('../config/prismaClient');

function mapConversation(conversation) {
  return {
    ...conversation,
    lastMessage: conversation.messages?.[0] || null,
    messageCount: conversation.messages?.length || 0,
  };
}

async function createConversation({ contactId, assignedToId, status = 'OPEN' }) {
  if (!contactId) throw new Error('Contact ID is required');

  const conversation = await prisma.conversation.create({
    data: {
      contactId,
      assignedToId: assignedToId || null,
      status,
    },
    include: {
      contact: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return mapConversation(conversation);
}

async function listConversations({ q } = {}) {
  const where = q
    ? {
        OR: [
          { contact: { name: { contains: q, mode: 'insensitive' } } },
          { contact: { phone: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      contact: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(mapConversation);
}

async function getConversation({ id }) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      contact: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  return mapConversation(conversation);
}

async function closeConversation({ id }) {
  const conversation = await prisma.conversation.update({
    where: { id },
    data: { status: 'CLOSED' },
    include: {
      contact: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return mapConversation(conversation);
}

async function assignAgent({ id, assignedToId }) {
  const conversation = await prisma.conversation.update({
    where: { id },
    data: { assignedToId: assignedToId || null },
    include: {
      contact: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return mapConversation(conversation);
}

async function listAgents() {
  return prisma.user.findMany({
    where: { role: 'AGENT' },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
}

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  closeConversation,
  assignAgent,
  listAgents,
};
