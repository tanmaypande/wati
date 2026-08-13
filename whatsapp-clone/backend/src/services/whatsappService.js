const axios = require('axios');
const prisma = require('../config/prismaClient');

const GRAPH_API_VERSION = 'v23.0';

function normalizePhoneNumber(phone) {
    if (!phone) return '';
    const str = String(phone).trim().replace(/[\s\-\(\)\.]/g, '');
    if (str.startsWith('+')) {
        return str.substring(1);
    }
    return str;
}

/**
 * Retrieve WhatsApp credentials for a workspace or global fallback
 */
async function getWhatsAppCredentials(workspaceId = null) {
    if (workspaceId) {
        const wa = await prisma.whatsAppAccount.findUnique({
            where: { workspaceId },
        });
        if (wa && wa.accessToken && wa.phoneNumberId) {
            return {
                token: wa.accessToken,
                phoneId: wa.phoneNumberId,
                businessAccountId: wa.businessAccountId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
                isPerWorkspace: true,
            };
        }
    }

    return {
        token: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        isPerWorkspace: false,
    };
}

/**
 * Save or update workspace WhatsApp configuration (secrets kept server-side)
 */
async function saveWhatsAppConfig(workspaceId, { phoneNumberId, businessAccountId, accessToken, verifyToken }) {
    if (!workspaceId) throw new Error('Workspace ID is required');

    const data = {
        status: accessToken && phoneNumberId ? 'CONNECTED' : 'INACTIVE',
    };
    if (phoneNumberId !== undefined) data.phoneNumberId = phoneNumberId;
    if (businessAccountId !== undefined) data.businessAccountId = businessAccountId;
    if (accessToken !== undefined) data.accessToken = accessToken;
    if (verifyToken !== undefined) data.verifyToken = verifyToken;

    return prisma.whatsAppAccount.upsert({
        where: { workspaceId },
        create: {
            workspaceId,
            ...data,
        },
        update: data,
    });
}

/**
 * Test WhatsApp API Credentials for a workspace or global config
 */
async function testConnection(workspaceId = null) {
    const creds = await getWhatsAppCredentials(workspaceId);

    if (!creds.token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured for this workspace');
    }
    if (!creds.phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured for this workspace');
    }

    try {
        const response = await axios.get(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phoneId}`,
            {
                headers: {
                    Authorization: `Bearer ${creds.token}`
                }
            }
        );
        return {
            configured: true,
            phoneNumberId: creds.phoneId,
            verifiedName: response.data?.verified_name || 'N/A',
            displayPhoneNumber: response.data?.display_phone_number || 'N/A',
            qualityRating: response.data?.quality_rating || 'UNKNOWN',
            metaStatus: 'CONNECTED',
            isPerWorkspace: creds.isPerWorkspace,
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
 * Send a WhatsApp text message scoped to tenant workspace credentials
 */
async function sendTextMessage(to, message, workspaceId = null) {
    const creds = await getWhatsAppCredentials(workspaceId);

    if (!creds.token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }
    if (!creds.phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }
    if (!to) {
        throw new Error('Recipient phone number is required');
    }
    if (!message) {
        throw new Error('Message is required');
    }

    const cleanTo = normalizePhoneNumber(to);
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phoneId}/messages`;

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
                    Authorization: `Bearer ${creds.token}`,
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
 * Send a WhatsApp template message scoped to tenant workspace credentials
 */
async function sendTemplateMessage(to, templateName = 'hello_world', languageCode = 'en_US', workspaceId = null) {
    const creds = await getWhatsAppCredentials(workspaceId);

    if (!creds.token) {
        throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }
    if (!creds.phoneId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }
    if (!to) {
        throw new Error('Recipient phone number is required');
    }

    const cleanTo = normalizePhoneNumber(to);
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phoneId}/messages`;

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
                    Authorization: `Bearer ${creds.token}`,
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
    getWhatsAppCredentials,
    saveWhatsAppConfig,
    testConnection,
    sendTextMessage,
    sendTemplateMessage,
};