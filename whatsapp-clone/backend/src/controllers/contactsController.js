const contactsService = require('../services/contactsService');
const { emitDashboardUpdate } = require('../socket/socketHandler');

function mapErrorToStatus(err) {
    if (!err) return 400;
    if (err.status) return err.status;

    const msg = (err.message || '').toLowerCase();

    if (msg.includes('phone already registered')) return 409;
    if (msg.includes('not found')) return 404;

    return 400;
}

async function createContact(req, res) {
    try {
        const { name, phone, email, profileImage } = req.body;

        const contact = await contactsService.createContact({
            workspaceId: req.user.workspaceId,
            name,
            phone,
            email,
            profileImage
        });

        try {
            emitDashboardUpdate({
                type: 'contact_created',
                contactId: contact.id,
                userId: req.user.id,
                workspaceId: req.user.workspaceId
            });
        } catch (emitErr) {
            console.warn('Failed to emit dashboard update', emitErr);
        }

        return res.status(201).json({
            success: true,
            data: contact
        });
    } catch (err) {
        console.error('Create contact error', err);
        const status = mapErrorToStatus(err);

        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

async function updateContact(req, res) {
    try {
        const { id } = req.params;
        const { name, phone, email, profileImage } = req.body;

        const updated = await contactsService.updateContact({
            id,
            workspaceId: req.user.workspaceId,
            name,
            phone,
            email,
            profileImage
        });

        return res.json({
            success: true,
            data: updated
        });
    } catch (err) {
        console.error('Update contact error', err);
        const status = mapErrorToStatus(err);

        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

async function deleteContact(req, res) {
    try {
        const { id } = req.params;

        await contactsService.deleteContact({
            id,
            workspaceId: req.user.workspaceId
        });

        return res.json({ success: true });
    } catch (err) {
        console.error('Delete contact error', err);
        const status = mapErrorToStatus(err);

        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

async function getContact(req, res) {
    try {
        const { id } = req.params;

        const contact = await contactsService.getContact({
            id,
            workspaceId: req.user.workspaceId
        });

        return res.json({
            success: true,
            data: contact
        });
    } catch (err) {
        console.error('Get contact error', err);
        const status = mapErrorToStatus(err);

        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

async function searchContacts(req, res) {
    try {
        const { q, page, limit } = req.query;

        const result = await contactsService.searchContacts({
            workspaceId: req.user.workspaceId,
            q,
            page,
            limit
        });

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Search contacts error', err);
        const status = mapErrorToStatus(err);

        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

const contactImportService = require('../services/contactImportService');

async function previewImport(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV or XLSX file.'
            });
        }

        const previewData = await contactImportService.previewImport({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            workspaceId: req.user.workspaceId,
        });

        return res.json({
            success: true,
            data: previewData
        });
    } catch (err) {
        console.error('Preview import error', err);
        const status = mapErrorToStatus(err);
        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

async function executeImport(req, res) {
    try {
        const { contacts } = req.body;

        const importResult = await contactImportService.executeImport({
            contacts,
            workspaceId: req.user.workspaceId,
        });

        try {
            emitDashboardUpdate({
                type: 'contacts_imported',
                userId: req.user.id,
                workspaceId: req.user.workspaceId,
                importedCount: importResult.imported
            });
        } catch (emitErr) {
            console.warn('Failed to emit dashboard update', emitErr);
        }

        return res.status(201).json({
            success: true,
            data: importResult
        });
    } catch (err) {
        console.error('Execute import error', err);
        const status = mapErrorToStatus(err);
        return res.status(status).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = {
    createContact,
    updateContact,
    deleteContact,
    getContact,
    searchContacts,
    previewImport,
    executeImport
};