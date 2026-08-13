import { useState } from 'react';
import { executeImportContacts, previewImportContacts } from '../../services/contactsApi';

function ImportContactsModal({ onClose, onImportSuccess }) {
  const [step, setStep] = useState('select'); // 'select' | 'preview' | 'result'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setError('Only CSV (.csv) and XLSX (.xlsx) files are supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Maximum file size is 10 MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const data = await previewImportContacts(selectedFile);
      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to parse file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || !previewData.rows) return;
    const validRows = previewData.rows.filter((r) => r.status === 'VALID');
    if (validRows.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const contactsToImport = validRows.map((r) => ({
        name: r.name,
        email: r.email,
        phone: r.phone,
      }));

      const result = await executeImportContacts(contactsToImport);
      setImportResult(result);
      setStep('result');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (status, msg) => {
    if (status === 'VALID') {
      return <span className="status-badge valid">Valid</span>;
    }
    if (status === 'INVALID') {
      return <span className="status-badge invalid">{msg || 'Invalid'}</span>;
    }
    if (status === 'DUPLICATE_FILE') {
      return <span className="status-badge duplicate">Duplicate in file</span>;
    }
    if (status === 'ALREADY_EXISTS') {
      return <span className="status-badge exists">Already exists</span>;
    }
    return <span className="status-badge invalid">{status}</span>;
  };

  return (
    <div className="import-modal-overlay">
      <div className="import-modal">
        <div className="import-modal-header">
          <h3>Import Contacts</h3>
          <button type="button" className="import-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="import-modal-body">
          {error ? <div className="alert alert-danger mb-3">{error}</div> : null}

          {step === 'select' ? (
            <div>
              <div className="mb-4" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>File Format Guidelines:</h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569' }}>
                  <li>Supported formats: <strong>CSV (.csv)</strong> and <strong>Excel (.xlsx)</strong></li>
                  <li>Required columns: <code>name</code>, <code>email</code>, <code>phone</code></li>
                  <li>Maximum file size: <strong>10 MB</strong> (Up to 10,000 rows per file)</li>
                </ul>
              </div>

              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '0.75rem',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: loading ? '#f1f5f9' : '#ffffff',
                }}
              >
                {loading ? (
                  <div style={{ color: '#2563eb', fontWeight: 600 }}>Parsing & validating file preview…</div>
                ) : (
                  <>
                    <p style={{ color: '#475569', marginBottom: '1rem' }}>
                      Select a CSV or XLSX file from your computer to preview contacts before import.
                    </p>
                    <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                      Choose File (.csv, .xlsx)
                      <input
                        type="file"
                        accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          ) : step === 'preview' ? (
            <div>
              {previewData && previewData.summary ? (
                <div className="import-summary-grid">
                  <div className="import-stat-card">
                    <strong>{previewData.summary.total}</strong>
                    <span>Total Rows</span>
                  </div>
                  <div className="import-stat-card valid">
                    <strong>{previewData.summary.valid}</strong>
                    <span>Valid</span>
                  </div>
                  <div className="import-stat-card invalid">
                    <strong>{previewData.summary.invalid}</strong>
                    <span>Invalid</span>
                  </div>
                  <div className="import-stat-card duplicate">
                    <strong>{previewData.summary.duplicateInFile}</strong>
                    <span>File Duplicate</span>
                  </div>
                  <div className="import-stat-card exists">
                    <strong>{previewData.summary.alreadyExists}</strong>
                    <span>Existing Contact</span>
                  </div>
                </div>
              ) : null}

              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Import Preview ({previewData?.rows?.length || 0} rows):
              </h5>

              <div className="import-table-container">
                <table className="import-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Row</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData && previewData.rows && previewData.rows.length > 0 ? (
                      previewData.rows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td>{row.rowNumber}</td>
                          <td>{row.name || <em style={{ color: '#94a3b8' }}>Empty</em>}</td>
                          <td>{row.email || <em style={{ color: '#94a3b8' }}>—</em>}</td>
                          <td>{row.phone || <em style={{ color: '#94a3b8' }}>Empty</em>}</td>
                          <td>{renderBadge(row.status, row.message)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                          No preview rows available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : step === 'result' ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '3rem', color: '#16a34a', marginBottom: '0.5rem' }}>✓</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Import Complete
              </h4>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                Contacts have been validated and saved to your workspace.
              </p>

              <div className="import-summary-grid" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                <div className="import-stat-card valid">
                  <strong>{importResult?.imported || 0}</strong>
                  <span>Successfully Imported</span>
                </div>
                <div className="import-stat-card duplicate">
                  <strong>{importResult?.duplicates || 0}</strong>
                  <span>Duplicates Skipped</span>
                </div>
                <div className="import-stat-card invalid">
                  <strong>{importResult?.invalid || 0}</strong>
                  <span>Invalid Skipped</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="import-modal-footer">
          {step === 'select' ? (
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          ) : step === 'preview' ? (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={loading}
                onClick={() => {
                  setStep('select');
                  setFile(null);
                  setPreviewData(null);
                  setError('');
                }}
              >
                Choose Different File
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading || !previewData || previewData.summary.valid === 0}
                onClick={handleExecuteImport}
              >
                {loading ? 'Importing…' : `Import Valid Contacts (${previewData?.summary?.valid || 0})`}
              </button>
            </>
          ) : step === 'result' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onImportSuccess();
                onClose();
              }}
            >
              View Contacts
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ImportContactsModal;
