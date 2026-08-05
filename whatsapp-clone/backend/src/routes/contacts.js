const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactsController');
const { authenticate } = require('../middleware/auth');

// List / search contacts
router.get('/', authenticate, controller.searchContacts);

// Create
router.post('/', authenticate, controller.createContact);

// Details
router.get('/:id', authenticate, controller.getContact);

// Update
router.put('/:id', authenticate, controller.updateContact);

// Delete
router.delete('/:id', authenticate, controller.deleteContact);

module.exports = router;
