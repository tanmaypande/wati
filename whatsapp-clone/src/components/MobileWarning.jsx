import { useEffect, useState } from 'react';
import '../styles/MobileWarning.css';

export default function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('watiMobileWarningDismissed');
      if (dismissed) return;
      if (window && window.innerWidth && window.innerWidth < 768) {
        setShow(true);
      }
    } catch (err) {
      // ignore sessionStorage errors
    }
  }, []);

  const continueAnyway = () => {
    try {
      sessionStorage.setItem('watiMobileWarningDismissed', '1');
    } catch (err) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mobile-warning-overlay" role="dialog" aria-modal="true" aria-label="Desktop recommended">
      <div className="mobile-warning-card">
        <h2>Desktop Recommended</h2>
        <p>This application is optimized for desktop and laptop screens. For the best experience, please open WATI on a desktop or laptop.</p>
        <div className="mobile-warning-actions">
          <button className="btn btn-outline-secondary" onClick={continueAnyway}>Continue Anyway</button>
        </div>
      </div>
    </div>
  );
}
