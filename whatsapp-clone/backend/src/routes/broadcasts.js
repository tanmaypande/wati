const express = require('express');
const router = express.Router();
const controller = require('../controllers/broadcastController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, controller.listBroadcasts);
router.post('/', authenticate, controller.createBroadcast);
router.get('/:id', authenticate, controller.getBroadcast);

module.exports = router;
