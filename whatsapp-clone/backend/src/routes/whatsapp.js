const express = require('express');
const router = express.Router();

const {
    sendTextMessage
} = require('../services/whatsappService');

const { authenticate } = require('../middleware/auth');


router.post('/send-test', authenticate, async (req, res) => {
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

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;