import React, { useState } from 'react';
import {
  Lock,
  Globe,
  Moon,
  Sun,
  Trash2,
  Download,
  Info,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function SettingsView() {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('eerafact-theme') === 'dark' ? 'dark' : 'light';
  });
  const [preferredLang, setPreferredLang] = useState('auto');
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark-mode');
      localStorage.setItem('eerafact-theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      localStorage.setItem('eerafact-theme', 'light');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all historical verification scans from your local SQLite database?')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/history/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage('Verification history successfully cleared from local database.');
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      alert('Failed to clear database records.');
    } finally {
      setClearing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) {
        const jsonStr = JSON.stringify(data.scans || [], null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `EeraFact_Scans_Export_${Date.now()}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert('Export failed.');
    }
  };

  return (
    <div className="clay-settings-view">
      <div className="settings-header-block">
        <span className="clay-section-kicker">PREFERENCES & GOVERNANCE</span>
        <h2 className="settings-main-title">Settings & Privacy</h2>
        <p className="settings-sub">
          Manage language detection, data retention, editorial theme, and privacy configurations.
        </p>
      </div>

      {message && (
        <div className="clay-card clay-toast-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="clay-settings-grid">
        {/* Card 1: Appearance & Theme */}
        <div className="clay-card clay-setting-box">
          <div className="setting-box-head">
            <div className="setting-icon-avatar">
              <Sun size={18} />
            </div>
            <div>
              <h3 className="setting-box-title">Appearance & Theme</h3>
              <p className="setting-box-desc">Choose between Warm Ivory editorial mode or Graphite Dark.</p>
            </div>
          </div>

          <div className="theme-selector-row">
            <button
              type="button"
              className={`clay-theme-option-btn ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={18} />
              <div>
                <div className="option-name">Warm Ivory (Clay)</div>
                <div className="option-sub">Editorial cream & deep forest green</div>
              </div>
            </button>

            <button
              type="button"
              className={`clay-theme-option-btn ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={18} />
              <div>
                <div className="option-name">Graphite Dark</div>
                <div className="option-sub">Deep slate with warm ambient clay</div>
              </div>
            </button>
          </div>
        </div>

        {/* Card 2: Vernacular Language Settings */}
        <div className="clay-card clay-setting-box">
          <div className="setting-box-head">
            <div className="setting-icon-avatar">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="setting-box-title">Vernacular Language Processing</h3>
              <p className="setting-box-desc">Configure multilingual claim interpretation.</p>
            </div>
          </div>

          <div className="language-radios">
            <label className="clay-radio-label">
              <input
                type="radio"
                name="language"
                checked={preferredLang === 'auto'}
                onChange={() => setPreferredLang('auto')}
              />
              <span className="radio-custom" />
              <div>
                <span className="radio-title">Auto-Detect (Recommended)</span>
                <span className="radio-sub">Automatically parse English, Hindi, and Hinglish syntax</span>
              </div>
            </label>

            <label className="clay-radio-label">
              <input
                type="radio"
                name="language"
                checked={preferredLang === 'en'}
                onChange={() => setPreferredLang('en')}
              />
              <span className="radio-custom" />
              <div>
                <span className="radio-title">English Primary</span>
                <span className="radio-sub">Prioritize national and global English news sources</span>
              </div>
            </label>

            <label className="clay-radio-label">
              <input
                type="radio"
                name="language"
                checked={preferredLang === 'hi'}
                onChange={() => setPreferredLang('hi')}
              />
              <span className="radio-custom" />
              <div>
                <span className="radio-title">Hindi & Regional Primary</span>
                <span className="radio-sub">Prioritize regional PIB alerts and Hindi fact-check desks</span>
              </div>
            </label>
          </div>
        </div>

        {/* Card 3: Privacy & Data Retention */}
        <div className="clay-card clay-setting-box">
          <div className="setting-box-head">
            <div className="setting-icon-avatar">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="setting-box-title">Privacy & Data Governance</h3>
              <p className="setting-box-desc">Control how user submissions are stored and managed.</p>
            </div>
          </div>

          <div className="privacy-explanation-banner">
            <Info size={16} className="privacy-info-icon" />
            <p>
              <strong>Data Privacy Commitment:</strong> EeraFact processes multimodal submissions in-memory and archives scan summaries in your local SQLite database (<code>scans.db</code>) solely for your audit history. No personal files are shared or sold to third-party ad networks.
            </p>
          </div>

          <div className="data-actions-row">
            <button
              type="button"
              className="clay-btn clay-btn-secondary clay-btn-sm"
              onClick={handleExportData}
            >
              <Download size={15} />
              <span>Export Verification History (JSON)</span>
            </button>

            <button
              type="button"
              className="clay-btn clay-btn-danger clay-btn-sm"
              onClick={handleClearHistory}
              disabled={clearing}
            >
              <Trash2 size={15} />
              <span>{clearing ? 'Clearing...' : 'Clear SQLite Database'}</span>
            </button>
          </div>
        </div>

        {/* Card 4: About EeraFact Architecture */}
        <div className="clay-card clay-setting-box">
          <div className="setting-box-head">
            <div className="setting-icon-avatar">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="setting-box-title">About EeraFact AI System</h3>
              <p className="setting-box-desc">Multi-signal multimodal fact-checking architecture.</p>
            </div>
          </div>

          <div className="about-tech-summary-list">
            <div className="tech-summary-item">
              <span className="item-key">Engine:</span>
              <span className="item-val">Grounded AI Verification + Search Grounding</span>
            </div>
            <div className="tech-summary-item">
              <span className="item-key">Image Forensics:</span>
              <span className="item-val">Error Level Analysis (ELA) with Thermal Spectrum</span>
            </div>
            <div className="tech-summary-item">
              <span className="item-key">Backend:</span>
              <span className="item-val">Python Flask REST API with SQLite3 Persistence</span>
            </div>
            <div className="tech-summary-item">
              <span className="item-key">Frontend:</span>
              <span className="item-val">React 19, Claymorphism Design System, Vite</span>
            </div>
            <div className="tech-summary-item">
              <span className="item-key">Mission:</span>
              <span className="item-val">Think. Verify. Trust. — Countering Digital Misinformation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
