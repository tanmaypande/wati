const prisma = require('../config/prismaClient');

function mapConversation(conversation) {
  return {
    ...conversation,
    lastMessage: conversation.messages?.[0] || null,
    messageCount: conversation.messages?.length || 0,
  };
}

async function createConversation({ contactId, assignedToId, status = 'OPEN', userId }) {
  if (!contactId) throw new Error('Contact ID is required');

  // Verify contact belongs to user
  const contact = await prisma.contact.findUnique({ where: { id: contactId }, select: { userId: true } });
  if (!contact || contact.userId !== userId) {
    const e = new Error('Contact not found');
    e.status = 404;
    throw e;
  }

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

async function listConversations({ q, userId } = {}) {
  // Only return conversations for contacts owned by the user
  const baseWhere = { contact: { userId } };

  const where = q
    ? {
        AND: [
          baseWhere,
          {
            OR: [
              { contact: { name: { contains: q, mode: 'insensitive' } } },
              { contact: { phone: { contains: q, mode: 'insensitive' } } },
            ],
          },
        ],
      }
    : baseWhere;

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

async function getConversation({ id, userId }) {
  // Ensure conversation belongs to a contact owned by the user
  const conversation = await prisma.conversation.findFirst({
    where: { id, contact: { userId } },
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

async function closeConversation({ id, userId }) {
  // Only allow closing if conversation belongs to user's contact
  const existing = await prisma.conversation.findFirst({ where: { id, contact: { userId } } });
  if (!existing) {
    const e = new Error('Conversation not found');
    e.status = 404;
    throw e;
  }

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

async function assignAgent({ id, assignedToId, userId }) {
  // Only allow assignment if conversation belongs to user's contact
  const existing = await prisma.conversation.findFirst({ where: { id, contact: { userId } } });
  if (!existing) {
    const e = new Error('Conversation not found');
    e.status = 404;
    throw e;
  }

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
