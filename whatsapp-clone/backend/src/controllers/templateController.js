const templateService = require('../services/templateService');

function mapErrorToStatus(err) {
  if (!err) return 400;
  if (err.status) return err.status;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('not found')) return 404;
  return 400;
}

async function listTemplates(req, res) {
  try {
    const templates = await templateService.listTemplates();
    return res.json({ success: true, data: templates });
  } catch (err) {
    console.error('List templates error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function getTemplate(req, res) {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplate({ id });
    return res.json({ success: true, data: template });
  } catch (err) {
    console.error('Get template error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function createTemplate(req, res) {
  try {
    const { name, category, body, status, language } = req.body;
    const template = await templateService.createTemplate({ name, category, body, status, language });
    return res.status(201).json({ success: true, data: template });
  } catch (err) {
    console.error('Create template error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const { name, category, body, status, language } = req.body;
    const template = await templateService.updateTemplate({ id, name, category, body, status, language });
    return res.json({ success: true, data: template });
  } catch (err) {
    console.error('Update template error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    await templateService.deleteTemplate({ id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete template error', err);
    const status = mapErrorToStatus(err);
    return res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
