const agentService = require('../services/agentService');

function mapErrorToStatus(err) {
  if (!err) return 400;
  if (err.status) return err.status;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('already registered')) return 409;
  if (msg.includes('not found')) return 404;
  return 400;
}

async function listAgents(req, res) {
  try {
    const agents = await agentService.listAgents({ workspaceId: req.user.workspaceId });
    return res.json({ success: true, data: agents });
  } catch (err) {
    console.error('List agents error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function createAgent(req, res) {
  try {
    const { name, email, password } = req.body;
    const agent = await agentService.createAgent({
      workspaceId: req.user.workspaceId,
      name,
      email,
      password,
    });
    return res.status(201).json({ success: true, data: agent });
  } catch (err) {
    console.error('Create agent error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function deleteAgent(req, res) {
  try {
    const { id } = req.params;
    await agentService.deleteAgent({ id, workspaceId: req.user.workspaceId });
    return res.json({ success: true, message: 'Agent removed successfully' });
  } catch (err) {
    console.error('Delete agent error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = {
  listAgents,
  createAgent,
  deleteAgent,
};
