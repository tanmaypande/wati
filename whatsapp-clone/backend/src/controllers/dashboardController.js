const dashboardService = require('../services/dashboardService');

async function overview(req, res) {
  try {
    const workspaceId = req.user && req.user.workspaceId;
    const data = await dashboardService.getOverview(workspaceId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Dashboard overview error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function recentChats(req, res) {
  try {
    const workspaceId = req.user && req.user.workspaceId;
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await dashboardService.getRecentChats(workspaceId, limit);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Recent chats error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function messagesChart(req, res) {
  try {
    const workspaceId = req.user && req.user.workspaceId;
    const days = parseInt(req.query.days, 10) || 7;
    const data = await dashboardService.getMessagesPerDay(workspaceId, days);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Messages chart error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  overview,
  recentChats,
  messagesChart,
};
