const express = require('express');
const router = express.Router();
const controller = require('../controllers/agentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All agent management endpoints require authentication
router.use(authenticate);

// List workspace agents (accessible to ADMIN and AGENT for UI dropdowns)
router.get('/', controller.listAgents);

// Create agent in workspace (SUPER_ADMIN and ADMIN)
router.post('/', authorize(['SUPER_ADMIN', 'ADMIN']), controller.createAgent);

// Delete/deactivate agent from workspace (SUPER_ADMIN and ADMIN)
router.delete('/:id', authorize(['SUPER_ADMIN', 'ADMIN']), controller.deleteAgent);

module.exports = router;
