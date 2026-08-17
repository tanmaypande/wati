import { useState } from 'react';
import api from '../services/api';

function SettingsWhatsApp() {
  const [configResult, setConfigResult] = useState(null);
  const [checkingConfig, setCheckingConfig] = useState(false);
  const [configError, setConfigError] = useState('');

  // Send Text Test Form
  const [textTo, setTextTo] = useState('');
  const [textMsg, setTextMsg] = useState('Hello! This is a test message from ConvoNest WhatsApp API.');
  const [textLoading, setTextLoading] = useState(false);
  const [textResult, setTextResult] = useState(null);
  const [textError, setTextError] = useState('');

  // Send Template Test Form
  const [templateTo, setTemplateTo] = useState('');
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLang, setTemplateLang] = useState('en_US');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateResult, setTemplateResult] = useState(null);
  const [templateError, setTemplateError] = useState('');

  const handleTestConfig = async () => {
    setCheckingConfig(true);
    setConfigError('');
    setConfigResult(null);

    try {
      const resp = await api.get('/whatsapp/test-config');
      setConfigResult(resp.data.data);
    } catch (err) {
      setConfigError(err?.response?.data?.message || err.message || 'Configuration check failed');
    } finally {
      setCheckingConfig(false);
    }
  };

  const handleSendTextTest = async (e) => {
    e.preventDefault();
    setTextLoading(true);
    setTextError('');
    setTextResult(null);

    try {
      const resp = await api.post('/whatsapp/send-test', {
        to: textTo,
        message: textMsg,
      });
      setTextResult(resp.data.data);
    } catch (err) {
      setTextError(err?.response?.data?.message || err.message || 'Failed to send text message');
    } finally {
      setTextLoading(false);
    }
  };

  const handleSendTemplateTest = async (e) => {
    e.preventDefault();
    setTemplateLoading(true);
    setTemplateError('');
    setTemplateResult(null);

    try {
      const resp = await api.post('/whatsapp/send-template-test', {
        to: templateTo,
        templateName,
        languageCode: templateLang,
      });
      setTemplateResult(resp.data.data);
    } catch (err) {
      setTemplateError(err?.response?.data?.message || err.message || 'Failed to send template message');
    } finally {
      setTemplateLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-card card mb-4">
        <div className="card-body">
          <h3>WhatsApp API Credentials & Connection Test</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Verify your Meta Graph API Access Token and Phone Number ID settings.
          </p>

          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={handleTestConfig}
            disabled={checkingConfig}
          >
            {checkingConfig ? 'Checking Meta API Connection…' : '🔌 Test Meta API Connection'}
          </button>

          {configError ? <div className="alert alert-danger">{configError}</div> : null}

          {configResult ? (
            <div className="alert alert-success mt-2">
              <h5 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 600 }}>✓ Meta API Connected</h5>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                <li>Phone Number ID: <code>{configResult.phoneNumberId}</code></li>
                <li>Verified Name: <strong>{configResult.verifiedName}</strong></li>
                <li>Display Number: <strong>{configResult.displayPhoneNumber}</strong></li>
                <li>Quality Rating: <strong>{configResult.qualityRating}</strong></li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="settings-card card h-100">
            <div className="card-body">
              <h3>Test Text Message API</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Send a custom test text message to a WhatsApp test recipient phone number.
              </p>

              <form onSubmit={handleSendTextTest}>
                <div className="mb-3">
                  <label className="form-label">Recipient Phone Number</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 919876543210"
                    required
                    value={textTo}
                    onChange={(e) => setTextTo(e.target.value)}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Country code without + (e.g., 919876543210)</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Test Message Content</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    value={textMsg}
                    onChange={(e) => setTextMsg(e.target.value)}
                  />
                </div>

                {textError ? <div className="alert alert-danger">{textError}</div> : null}
                {textResult ? (
                  <div className="alert alert-success">
                    ✓ Message sent successfully! ID: <code>{textResult?.messages?.[0]?.id || 'Success'}</code>
                  </div>
                ) : null}

                <button className="btn btn-primary w-100" type="submit" disabled={textLoading}>
                  {textLoading ? 'Sending Text Message…' : '📤 Send Test Text Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="settings-card card h-100">
            <div className="card-body">
              <h3>Test Template Message API</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Send a Meta pre-approved WhatsApp template message (e.g., <code>hello_world</code>).
              </p>

              <form onSubmit={handleSendTemplateTest}>
                <div className="mb-3">
                  <label className="form-label">Recipient Phone Number</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 919876543210"
                    required
                    value={templateTo}
                    onChange={(e) => setTemplateTo(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Template Name</label>
                  <input
                    className="form-control"
                    placeholder="hello_world"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Language Code</label>
                  <input
                    className="form-control"
                    placeholder="en_US"
                    value={templateLang}
                    onChange={(e) => setTemplateLang(e.target.value)}
                  />
                </div>

                {templateError ? <div className="alert alert-danger">{templateError}</div> : null}
                {templateResult ? (
                  <div className="alert alert-success">
                    ✓ Template sent successfully! ID: <code>{templateResult?.messages?.[0]?.id || 'Success'}</code>
                  </div>
                ) : null}

                <button className="btn btn-primary w-100" type="submit" disabled={templateLoading}>
                  {templateLoading ? 'Sending Template…' : '📋 Send Test Template'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsWhatsApp;
