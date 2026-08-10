const express = require('express');
const router = express.Router();
const controller = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, controller.listTemplates);
router.post('/', authenticate, controller.createTemplate);
router.get('/:id', authenticate, controller.getTemplate);
router.put('/:id', authenticate, controller.updateTemplate);
router.delete('/:id', authenticate, controller.deleteTemplate);

module.exports = router;
