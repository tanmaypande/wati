const superAdminService = require('../services/superAdminService');
const { getAuditLogs } = require('../services/auditLogService');

async function getOverview(req, res) {
  try {
    const overview = await superAdminService.getPlatformOverview();
    return res.json({ success: true, data: overview });
  } catch (err) {
    console.error('Super Admin Overview Error:', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function listWorkspaces(req, res) {
  try {
    const { q, status, page, limit } = req.query;
    const result = await superAdminService.listWorkspaces({ q, status, page, limit });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Super Admin List Workspaces Error:', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function createCompany(req, res) {
  try {
    const { name, adminName, adminEmail, adminPassword } = req.body;
    const actorUserId = req.user.id;
    const result = await superAdminService.createCompany({
      name,
      adminName,
      adminEmail,
      adminPassword,
      actorUserId,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Super Admin Create Company Error:', err);
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

async function getWorkspaceDetail(req, res) {
  try {
    const { workspaceId } = req.params;
    const detail = await superAdminService.getWorkspaceDetail(workspaceId);
    return res.json({ success: true, data: detail });
  } catch (err) {
    console.error('Super Admin Get Workspace Detail Error:', err);
    return res.status(err.status || 404).json({ success: false, message: err.message });
  }
}

async function updateWorkspaceStatus(req, res) {
  try {
    const { workspaceId } = req.params;
    const { status } = req.body;
    const actorUserId = req.user.id;
    const updated = await superAdminService.updateWorkspaceStatus({ workspaceId, status, actorUserId });
    return res.json({ success: true, data: updated, message: `Company status updated to ${status}` });
  } catch (err) {
    console.error('Super Admin Update Workspace Status Error:', err);
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

async function createWorkspaceAdmin(req, res) {
  try {
    const { workspaceId } = req.params;
    const { name, email, password } = req.body;
    const actorUserId = req.user.id;
    const adminUser = await superAdminService.createWorkspaceAdmin({
      workspaceId,
      name,
      email,
      password,
      actorUserId,
    });
    return res.status(201).json({ success: true, data: adminUser });
  } catch (err) {
    console.error('Super Admin Create Workspace Admin Error:', err);
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const { q, role, workspaceId, page, limit } = req.query;
    const result = await superAdminService.listPlatformUsers({ q, role, workspaceId, page, limit });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Super Admin List Users Error:', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function toggleUserActive(req, res) {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const actorUserId = req.user.id;
    const updated = await superAdminService.toggleUserActive({ userId, isActive, actorUserId });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Super Admin Toggle User Active Error:', err);
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

async function getAuditLogsHandler(req, res) {
  try {
    const { page, limit, workspaceId, action } = req.query;
    const logs = await getAuditLogs({ page, limit, workspaceId, action });
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Super Admin Audit Logs Error:', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function getSystemHealth(req, res) {
  try {
    const health = await superAdminService.getSystemHealth();
    return res.json({ success: true, data: health });
  } catch (err) {
    console.error('Super Admin System Health Error:', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function createPlatformUser(req, res) {
  try {
    const { name, email, password, role, workspaceId } = req.body;
    const actorUserId = req.user.id;
    const newUser = await superAdminService.createPlatformUser({
      name,
      email,
      password,
      role,
      workspaceId,
      actorUserId,
    });
    return res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    console.error('Super Admin Create Platform User Error:', err);
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getOverview,
  listWorkspaces,
  createCompany,
  getWorkspaceDetail,
  updateWorkspaceStatus,
  createWorkspaceAdmin,
  listUsers,
  createPlatformUser,
  toggleUserActive,
  getAuditLogsHandler,
  getSystemHealth,
};
