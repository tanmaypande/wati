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
  // Scoping: SUPER_ADMIN and ADMIN see all workspace conversations; AGENT sees assigned conversations or unassigned in workspace
  const isAdminRole = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const roleWhere = isAdminRole
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
  const isAdminRole = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const roleWhere = isAdminRole
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

async function sendMessage({ conversationId, content, sender = 'AGENT', workspaceId }) {
  if (!conversationId) throw new Error('Conversation ID is required');
  if (!content || !content.trim()) throw new Error('Message content cannot be empty');

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
    include: { contact: true },
  });

  if (!conversation) {
    const e = new Error('Conversation not found');
    e.status = 404;
    throw e;
  }

  // Attempt sending real WhatsApp Cloud API message if configured
  try {
    const whatsappService = require('./whatsappService');
    if (conversation.contact?.phone) {
      await whatsappService.sendTextMessage(conversation.contact.phone, content.trim(), workspaceId).catch((err) => {
        console.warn('WhatsApp Cloud API notice:', err.message);
      });
    }
  } catch (err) {
    console.warn('WhatsApp service notice:', err.message);
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      sender: sender === 'CUSTOMER' ? 'CUSTOMER' : 'AGENT',
      content: content.trim(),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
}

async function suggestAIReply({ conversationId, workspaceId }) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
    include: {
      contact: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!conversation) {
    const e = new Error('Conversation not found');
    e.status = 404;
    throw e;
  }

  const lastCustomerMsg = conversation.messages?.find((m) => m.sender === 'CUSTOMER')?.content;
  const name = conversation.contact?.name || 'Customer';

  if (!lastCustomerMsg) {
    return `Hello ${name}! How can I help you today with your workspace or query?`;
  }

  const lower = lastCustomerMsg.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
    return `Hi ${name}, thank you for reaching out! Our pricing details and plans are available. Let me know which service you are interested in.`;
  } else if (lower.includes('order') || lower.includes('status') || lower.includes('track')) {
    return `Hi ${name}, I am checking your order status right now. Please allow me a moment to provide you with the update.`;
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello ${name}! Welcome to our WhatsApp customer support. How may I assist you today?`;
  } else {
    return `Hi ${name}, thanks for your message. I am looking into this right now and will assist you shortly.`;
  }
}

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  closeConversation,
  assignAgent,
  listAgents,
  sendMessage,
  suggestAIReply,
};
