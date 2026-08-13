const broadcastService = require('../services/broadcastService');
const templateService = require('../services/templateService');

function mapErrorToStatus(err) {
  if (!err) return 400;
  if (err.status) return err.status;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('not found')) return 404;
  return 400;
}

async function listBroadcasts(req, res) {
  try {
    const broadcasts = await broadcastService.listBroadcasts({ workspaceId: req.user.workspaceId });
    return res.json({ success: true, data: broadcasts });
  } catch (err) {
    console.error('List broadcasts error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function getBroadcast(req, res) {
  try {
    const { id } = req.params;
    const b = await broadcastService.getBroadcast({ id, workspaceId: req.user.workspaceId });
    return res.json({ success: true, data: b });
  } catch (err) {
    console.error('Get broadcast error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function createBroadcast(req, res) {
  try {
    const { title, message, templateId, recipientIds, recipientCount, status } = req.body;
    const prisma = require('../config/prismaClient');

    if (!title || !title.trim()) {
      const err = new Error('Broadcast name is required');
      err.status = 400;
      throw err;
    }

    let finalMessage = message;
    if (templateId) {
      try {
        const template = await templateService.getTemplate({ id: templateId, workspaceId: req.user.workspaceId });
        if (!finalMessage) {
          finalMessage = template?.body;
        }
      } catch (err) {
        console.warn('Template fetch notice:', err.message);
      }
    }

    if (!finalMessage || !finalMessage.trim()) {
      const err = new Error('Broadcast message content or template is required');
      err.status = 400;
      throw err;
    }

    const broadcast = await broadcastService.createBroadcast({
      workspaceId: req.user.workspaceId,
      title: title.trim(),
      message: finalMessage.trim(),
    });

    // Send broadcast messages to recipients via WhatsApp API if recipientIds provided
    if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
      try {
        const contacts = await prisma.contact.findMany({
          where: { id: { in: recipientIds }, workspaceId: req.user.workspaceId },
          select: { phone: true }
        });
        const whatsappService = require('../services/whatsappService');
        for (const contact of contacts) {
          if (contact.phone) {
            whatsappService.sendTextMessage(contact.phone, finalMessage.trim()).catch((err) => {
              console.warn('Broadcast dispatch notice:', err.message);
            });
          }
        }
      } catch (dispatchErr) {
        console.warn('Broadcast dispatch notice:', dispatchErr.message);
      }
    }

    return res.status(201).json({ success: true, data: broadcast });
  } catch (err) {
    console.error('Create broadcast error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = {
  listBroadcasts,
  getBroadcast,
  createBroadcast,
};
