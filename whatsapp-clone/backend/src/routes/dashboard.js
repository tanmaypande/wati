const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

// Protected routes for dashboard data
router.get('/overview', authenticate, controller.overview);
router.get('/recent', authenticate, controller.recentChats);
router.get('/messages-chart', authenticate, controller.messagesChart);

module.exports = router;
