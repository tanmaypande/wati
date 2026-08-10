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
    const broadcasts = await broadcastService.listBroadcasts();
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
    const b = await broadcastService.getBroadcast({ id });
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

    // Basic validation
    if (!title) {
      const err = new Error('Title is required');
      err.status = 400;
      throw err;
    }
    if (templateId) {
      // ensure template exists
      await templateService.getTemplate({ id: templateId });
    } else {
      const err = new Error('Template is required');
      err.status = 400;
      throw err;
    }
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      const err = new Error('At least one recipient is required');
      err.status = 400;
      throw err;
    }

    const broadcast = await broadcastService.createBroadcast({ title, message, templateId, recipientIds, recipientCount: recipientCount || recipientIds.length, status: status || 'DRAFT', createdBy: req.user && req.user.id });

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
