const express = require('express');
const router = express.Router();
const controller = require('../controllers/workspaceController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(authenticate);

// Get current workspace info
router.get('/', controller.getWorkspace);

// Update current workspace info (SUPER_ADMIN and ADMIN only)
router.patch('/', authorize(['SUPER_ADMIN', 'ADMIN']), controller.updateWorkspace);

module.exports = router;
