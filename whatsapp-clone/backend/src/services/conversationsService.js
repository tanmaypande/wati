const prisma = require('../config/prismaClient');

function mapConversation(conversation) {
  return {
    ...conversation,
    lastMessage: conversation.messages?.[0] || null,
    messageCount: conversation.messages?.length || 0,
  };
}

async function createConversation({ contactId, assignedToId, status = 'OPEN', workspaceId, userId, role }) {
  if (!contactId) throw new Error('Contact ID is required');

  // Verify contact belongs to caller's workspace
  const contact = await prisma.contact.findUnique({ where: { id: contactId }, select: { workspaceId: true } });
  if (!contact || contact.workspaceId !== workspaceId) {
    const e = new Error('Contact not found');
    e.status = 404;
    throw e;
  }

  // If assignedToId is provided, verify target agent belongs to same workspace
  if (assignedToId) {
    const targetAgent = await prisma.user.findUnique({ where: { id: assignedToId }, select: { workspaceId: true } });
    if (!targetAgent || targetAgent.workspaceId !== workspaceId) {
      const e = new Error('Target agent does not belong to your workspace');
      e.status = 403;
      throw e;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      contactId,
      workspaceId,
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

async function listConversations({ q, workspaceId, userId, role } = {}) {
  // Scoping: ADMIN sees all workspace conversations; AGENT sees assigned conversations or unassigned in workspace
  const roleWhere = role === 'ADMIN'
    ? { workspaceId }
    : { workspaceId, OR: [{ assignedToId: userId }, { assignedToId: null }] };

  const where = q
    ? {
        AND: [
          roleWhere,
          {
            OR: [
              { contact: { name: { contains: q, mode: 'insensitive' } } },
              { contact: { phone: { contains: q, mode: 'insensitive' } } },
            ],
          },
        ],
      }
    : roleWhere;

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

async function getConversation({ id, workspaceId, userId, role }) {
  const roleWhere = role === 'ADMIN'
    ? { id, workspaceId }
    : { id, workspaceId, OR: [{ assignedToId: userId }, { assignedToId: null }] };

  const conversation = await prisma.conversation.findFirst({
    where: roleWhere,
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

async function closeConversation({ id, workspaceId, userId, role }) {
  const existing = await prisma.conversation.findFirst({ where: { id, workspaceId } });
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

async function assignAgent({ id, assignedToId, workspaceId, role }) {
  // Ensure caller has access to conversation in their workspace
  const existing = await prisma.conversation.findFirst({ where: { id, workspaceId } });
  if (!existing) {
    const e = new Error('Conversation not found');
    e.status = 404;
    throw e;
  }

  // PRIORITY 8: Verify assignedToId agent belongs to the SAME workspace!
  if (assignedToId) {
    const targetAgent = await prisma.user.findUnique({ where: { id: assignedToId }, select: { workspaceId: true } });
    if (!targetAgent || targetAgent.workspaceId !== workspaceId) {
      const e = new Error('Target agent does not belong to your workspace');
      e.status = 403;
      throw e;
    }
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

async function listAgents({ workspaceId }) {
  return prisma.user.findMany({
    where: { workspaceId, role: 'AGENT' },
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
