const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const GRAPH_API_VERSION = 'v23.0';

const WHATSAPP_API_URL =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;


function normalizePhoneNumber(phone) {
    if (!phone) return '';
    const str = String(phone).trim().replace(/[\s\-\(\)\.]/g, '');
    if (str.startsWith('+')) {
        return str.substring(1);
    }
    return str;
}

/**
 * Test WhatsApp API Credentials and Meta Graph API Connection
 */
async function testConnection() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured in .env');
    }
    if (!phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured in .env');
    }

    try {
        const response = await axios.get(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return {
            configured: true,
            phoneNumberId: phoneId,
            verifiedName: response.data?.verified_name || 'N/A',
            displayPhoneNumber: response.data?.display_phone_number || 'N/A',
            qualityRating: response.data?.quality_rating || 'UNKNOWN',
            metaStatus: 'CONNECTED'
        };
    } catch (error) {
        console.error('WhatsApp API testConnection error:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.error?.message ||
            'Failed to connect to Meta WhatsApp Graph API. Check your ACCESS_TOKEN and PHONE_NUMBER_ID.'
        );
    }
}

/**
 * Send a WhatsApp text message
 */
async function sendTextMessage(to, message) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN || ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || PHONE_NUMBER_ID;

    if (!token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }
    if (!phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }
    if (!to) {
        throw new Error('Recipient phone number is required');
    }
    if (!message) {
        throw new Error('Message is required');
    }

    const cleanTo = normalizePhoneNumber(to);
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;

    try {
        const response = await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanTo,
                type: 'text',
                text: {
                    preview_url: false,
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
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

/**
 * Send a WhatsApp template message
 */
async function sendTemplateMessage(to, templateName = 'hello_world', languageCode = 'en_US') {
    const token = process.env.WHATSAPP_ACCESS_TOKEN || ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || PHONE_NUMBER_ID;

    if (!token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }
    if (!phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }
    if (!to) {
        throw new Error('Recipient phone number is required');
    }

    const cleanTo = normalizePhoneNumber(to);
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;

    try {
        const response = await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanTo,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            'WhatsApp template error:',
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.error?.message ||
            'Failed to send WhatsApp template message'
        );
    }
}

module.exports = {
    normalizePhoneNumber,
    testConnection,
    sendTextMessage,
    sendTemplateMessage
};