const express = require('express');
const router = express.Router();

const {
    testConnection,
    sendTextMessage,
    sendTemplateMessage,
    saveWhatsAppConfig
} = require('../services/whatsappService');

const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * GET /api/whatsapp/test-config
 * Checks API credentials for caller's workspace and tests connection to Meta Graph API
 */
router.get('/test-config', async (req, res) => {
    try {
        const result = await testConnection(req.user.workspaceId);
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
 * POST /api/whatsapp/config
 * Save per-workspace WhatsApp credentials
 */
router.post('/config', async (req, res) => {
    try {
        const { phoneNumberId, businessAccountId, accessToken, verifyToken } = req.body;
        if (!req.user.workspaceId) {
            return res.status(400).json({ success: false, message: 'Tenant workspace context required' });
        }

        const saved = await saveWhatsAppConfig(req.user.workspaceId, {
            phoneNumberId,
            businessAccountId,
            accessToken,
            verifyToken
        });

        return res.json({
            success: true,
            data: {
                id: saved.id,
                workspaceId: saved.workspaceId,
                phoneNumberId: saved.phoneNumberId,
                status: saved.status,
                updatedAt: saved.updatedAt
            },
            message: 'Workspace WhatsApp configuration updated successfully'
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
 * Send a test text message via WhatsApp API using workspace credentials
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

        const result = await sendTextMessage(to, message, req.user.workspaceId);

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
 * Send a test template message via WhatsApp API using workspace credentials
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
            languageCode || 'en_US',
            req.user.workspaceId
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