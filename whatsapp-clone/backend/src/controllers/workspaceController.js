const prisma = require('../config/prismaClient');

async function getWorkspace(req, res) {
  try {
    const workspaceId = req.user && req.user.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Workspace context missing' });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        whatsappAccount: {
          select: { status: true, phoneNumberId: true, businessAccountId: true, updatedAt: true }
        },
        _count: {
          select: {
            users: true,
            contacts: true,
            conversations: true,
            templates: true,
            broadcasts: true,
          }
        }
      }
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    return res.json({ success: true, data: workspace });
  } catch (err) {
    console.error('Get workspace error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch workspace info' });
  }
}

async function updateWorkspace(req, res) {
  try {
    const workspaceId = req.user && req.user.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'Workspace context missing' });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: name.trim() }
    });

    return res.json({ success: true, data: updated, message: 'Workspace updated successfully' });
  } catch (err) {
    console.error('Update workspace error', err);
    return res.status(500).json({ success: false, message: 'Failed to update workspace' });
  }
}

module.exports = {
  getWorkspace,
  updateWorkspace,
};
