import { useMemo, useState, useEffect } from 'react';

function extractVariables(body = '') {
  const matches = body.match(/\{\{\d+\}\}/g) || [];
  return [...new Set(matches)];
}

export default function TemplatePreview({ body }) {
  const variables = useMemo(() => extractVariables(body), [body]);
  const [values, setValues] = useState({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValues((current) => {
        const next = {};
        variables.forEach((token) => {
          next[token] = current[token] || '';
        });
        return next;
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [variables]);

  const renderedBody = useMemo(() => {
    let preview = body;
    variables.forEach((token) => {
      preview = preview.replaceAll(token, values[token] ? values[token] : token);
    });
    return preview;
  }, [body, values, variables]);

  return (
    <div className="template-preview-card">
      <div className="template-preview-card__header">
        <h3>Live preview</h3>
        <p>See how the message will look in WhatsApp.</p>
      </div>

      <div className="template-preview-card__body">
        <div className="template-preview-bubble">
          {renderedBody.split('\n').map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </div>

      <div className="template-preview-card__inputs">
        {variables.length ? (
          variables.map((token) => (
            <label className="template-preview-input" key={token}>
              <span>{`Variable ${token.replace(/\D/g, '')}`}</span>
              <input
                type="text"
                value={values[token] || ''}
                onChange={(event) => setValues((current) => ({ ...current, [token]: event.target.value }))}
                placeholder={`Enter ${token}`}
              />
            </label>
          ))
        ) : (
          <p className="template-variable-empty">Add variables to personalize the preview.</p>
        )}
      </div>
    </div>
  );
}
