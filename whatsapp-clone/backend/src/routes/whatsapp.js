const express = require('express');
const router = express.Router();

const {
    testConnection,
    sendTextMessage,
    sendTemplateMessage
} = require('../services/whatsappService');

const { authenticate } = require('../middleware/auth');

// All WhatsApp test endpoints require authentication
router.use(authenticate);

/**
 * GET /api/whatsapp/test-config
 * Checks API credentials (.env) and tests connection to Meta Graph API
 */
router.get('/test-config', async (req, res) => {
    try {
        const result = await testConnection();
        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/whatsapp/send-test
 * Send a test text message via WhatsApp API
 */
router.post('/send-test', async (req, res) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'to and message are required'
            });
        }

        const result = await sendTextMessage(to, message);

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('WhatsApp send-test error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/whatsapp/send-template-test
 * Send a test template message via WhatsApp API
 */
router.post('/send-template-test', async (req, res) => {
    try {
        const { to, templateName, languageCode } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'to (recipient phone number) is required'
            });
        }

        const result = await sendTemplateMessage(
            to,
            templateName || 'hello_world',
            languageCode || 'en_US'
        );

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('WhatsApp send-template-test error:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;