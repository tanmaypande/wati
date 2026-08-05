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

  // Raw query for flexibility across postgres date_trunc
  const result = await prisma.$queryRaw(Prisma.sql`
    SELECT DATE("createdAt") as day, COUNT(*) as count
    FROM "Message"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `);

  // Normalize result to ensure all days are present
  const map = {};
  result.forEach((r) => {
    map[r.day.toISOString().slice(0, 10)] = Number(r.count);
  });

  const points = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    points.push({ day: key, count: map[key] || 0 });
  }

  return points;
}

module.exports = {
  getOverview,
  getRecentChats,
  getMessagesPerDay,
};
