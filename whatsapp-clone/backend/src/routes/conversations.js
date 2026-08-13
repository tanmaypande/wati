const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationsController');
const { authenticate } = require('../middleware/auth');

router.get('/agents', authenticate, controller.listAgents);
router.get('/', authenticate, controller.listConversations);
router.post('/', authenticate, controller.createConversation);
router.get('/:id', authenticate, controller.getConversation);
router.patch('/:id/close', authenticate, controller.closeConversation);
router.patch('/:id/assign', authenticate, controller.assignAgent);
router.post('/:id/messages', authenticate, controller.sendMessage);
router.post('/:id/ai-suggest', authenticate, controller.suggestAIReply);

module.exports = router;
