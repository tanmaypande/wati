const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const superAdminAuth = require('../middleware/superAdminAuth');
const superAdminController = require('../controllers/superAdminController');

// All Super Admin routes require Authentication & SUPER_ADMIN role
router.use(authenticate, superAdminAuth);

// Platform Dashboard Overview
router.get('/dashboard/stats', superAdminController.getOverview);

// Company / Workspace Management
router.get('/workspaces', superAdminController.listWorkspaces);
router.post('/workspaces', superAdminController.createCompany);
router.get('/workspaces/:workspaceId', superAdminController.getWorkspaceDetail);
router.patch('/workspaces/:workspaceId/status', superAdminController.updateWorkspaceStatus);
router.post('/workspaces/:workspaceId/admins', superAdminController.createWorkspaceAdmin);

// Platform User Management
router.get('/users', superAdminController.listUsers);
router.patch('/users/:userId/active', superAdminController.toggleUserActive);

// Platform Audit Logs & System Health
router.get('/audit-logs', superAdminController.getAuditLogsHandler);
router.get('/health', superAdminController.getSystemHealth);

module.exports = router;
