const conversationsService = require('../services/conversationsService');

function mapErrorToStatus(err) {
  if (!err) return 400;
  if (err.status) return err.status;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('not found')) return 404;
  if (msg.includes('already')) return 409;
  return 400;
}

async function listConversations(req, res) {
  try {
    const { q } = req.query;
    const conversations = await conversationsService.listConversations({
      q,
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      role: req.user.role,
    });
    return res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('List conversations error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function createConversation(req, res) {
  try {
    const { contactId, assignedToId, status } = req.body;
    const conversation = await conversationsService.createConversation({
      contactId,
      assignedToId,
      status,
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      role: req.user.role,
    });
    return res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    console.error('Create conversation error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function getConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await conversationsService.getConversation({
      id,
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      role: req.user.role,
    });
    return res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('Get conversation error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function closeConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await conversationsService.closeConversation({
      id,
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      role: req.user.role,
    });
    return res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('Close conversation error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function assignAgent(req, res) {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;
    const conversation = await conversationsService.assignAgent({
      id,
      assignedToId,
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      role: req.user.role,
    });
    return res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('Assign agent error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function listAgents(req, res) {
  try {
    const agents = await conversationsService.listAgents({ workspaceId: req.user.workspaceId });
    return res.json({ success: true, data: agents });
  } catch (err) {
    console.error('List agents error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { content, sender } = req.body;
    const message = await conversationsService.sendMessage({
      conversationId: id,
      content,
      sender,
      workspaceId: req.user.workspaceId,
    });
    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('Send message error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function suggestAIReply(req, res) {
  try {
    const { id } = req.params;
    const suggestion = await conversationsService.suggestAIReply({
      conversationId: id,
      workspaceId: req.user.workspaceId,
    });
    return res.json({ success: true, data: { suggestion } });
  } catch (err) {
    console.error('AI suggest error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  closeConversation,
  assignAgent,
  listAgents,
  sendMessage,
  suggestAIReply,
};
