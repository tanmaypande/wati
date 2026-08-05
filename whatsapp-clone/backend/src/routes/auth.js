const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

// Protected routes - require a valid access token in Authorization: Bearer <token>
router.get('/me', authenticate, controller.me);
router.post('/change-password', authenticate, controller.changePassword);

module.exports = router;
