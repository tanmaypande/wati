const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * Fetch overview counts for the dashboard.
 * Returns totalContacts, totalConversations, activeConversations, closedConversations,
 * broadcastCount, templatesCount
 */
async function getOverview() {
  const [totalContacts, totalConversations, activeConversations, closedConversations, broadcastCount, templatesCount] = await Promise.all([
    prisma.contact.count(),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: 'OPEN' } }),
    prisma.conversation.count({ where: { status: 'CLOSED' } }),
    prisma.broadcast.count(),
    prisma.template.count(),
  ]);

  return {
    totalContacts,
    totalConversations,
    activeConversations,
    closedConversations,
    broadcastCount,
    templatesCount,
  };
}

/**
 * Recent chats: return last N active conversations with latest message and contact summary
 */
async function getRecentChats(limit = 10) {
  // Find most recently updated conversations and include last message and contact
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    contact: {
      id: c.contact.id,
      name: c.contact.name,
      phone: c.contact.phone,
      profileImage: c.contact.profileImage || null,
    },
    lastMessage: c.messages[0] || null,
    status: c.status,
    updatedAt: c.updatedAt,
  }));
}

/**
 * Aggregate messages per day for the last N days - used for charts
 */
async function getMessagesPerDay(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));

  // Raw query grouping by day and sender so we can split sent/received
  const result = await prisma.$queryRaw(Prisma.sql`
    SELECT DATE("createdAt") as day, "sender" as sender, COUNT(*) as count
    FROM "Message"
    WHERE "createdAt" >= ${since}
    GROUP BY day, sender
    ORDER BY day ASC
  `);

  // Organize by day
  const map = {};
  result.forEach((r) => {
    const key = r.day.toISOString().slice(0, 10);
    if (!map[key]) map[key] = { sent: 0, received: 0 };
    if ((r.sender || '').toUpperCase() === 'AGENT') map[key].sent = Number(r.count);
    else map[key].received = Number(r.count);
  });

  const points = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const sent = (map[key] && map[key].sent) || 0;
    const received = (map[key] && map[key].received) || 0;
    points.push({ day: key, sent, received, count: sent + received });
  }

  return points;
}

module.exports = {
  getOverview,
  getRecentChats,
  getMessagesPerDay,
};
