const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const GRAPH_API_VERSION = 'v23.0';

const WHATSAPP_API_URL =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;


/**
 * Send a WhatsApp text message
 */
async function sendTextMessage(to, message) {
    if (!ACCESS_TOKEN) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }

    if (!PHONE_NUMBER_ID) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    if (!to) {
        throw new Error('Recipient phone number is required');
    }

    if (!message) {
        throw new Error('Message is required');
    }

    try {
        const response = await axios.post(
            WHATSAPP_API_URL,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: {
                    preview_url: false,
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            'WhatsApp API error:',
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.error?.message ||
            'Failed to send WhatsApp message'
        );
    }
}


module.exports = {
    sendTextMessage
};