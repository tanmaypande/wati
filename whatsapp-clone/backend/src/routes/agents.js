const express = require('express');
const router = express.Router();
const controller = require('../controllers/agentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All agent management endpoints require authentication
router.use(authenticate);

// List workspace agents (accessible to ADMIN and AGENT for UI dropdowns)
router.get('/', controller.listAgents);

// Create agent in workspace (ADMIN only)
router.post('/', authorize(['ADMIN']), controller.createAgent);

// Delete/deactivate agent from workspace (ADMIN only)
router.delete('/:id', authorize(['ADMIN']), controller.deleteAgent);

module.exports = router;
