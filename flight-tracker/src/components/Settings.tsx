import { useState } from 'react';
import { getApiKey, setApiKey } from '../services/flightApi';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [key, setKey] = useState(getApiKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal pixel-border" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">SETTINGS</span>
          <button type="button" className="remove-btn" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <label className="settings-label" htmlFor="api-key">
              AVIATIONSTACK API KEY
            </label>
            <p className="settings-hint">
              Get a free key at aviationstack.com.
              Without a key, only demo flights work.
            </p>
            <input
              id="api-key"
              className="pixel-input"
              type="password"
              placeholder="Enter your API key"
              value={key}
              onChange={(e) => { setKey(e.target.value); setSaved(false); }}
              autoComplete="off"
            />
          </div>

          <div className="settings-actions">
            <button className="pixel-btn" onClick={onClose}>
              CLOSE
            </button>
            <button className="pixel-btn primary" onClick={handleSave}>
              {saved ? 'SAVED!' : 'SAVE KEY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
