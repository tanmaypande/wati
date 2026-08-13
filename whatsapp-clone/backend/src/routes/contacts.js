const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/contactsController');
const { authenticate } = require('../middleware/auth');

// Multer memory storage configuration (10 MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    if (ext === 'csv' || ext === 'xlsx') {
      cb(null, true);
    } else {
      const err = new Error('Only CSV (.csv) and XLSX (.xlsx) files are supported.');
      err.status = 400;
      cb(err);
    }
  },
});

// Import preview (file upload)
router.post('/import/preview', authenticate, upload.single('file'), controller.previewImport);

// Final import execution
router.post('/import', authenticate, controller.executeImport);

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
