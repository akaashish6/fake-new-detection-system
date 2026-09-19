import React, { useState } from 'react';
import Navigation from './components/Navigation';
import LandingView from './components/LandingView';
import InputForm from './components/InputForm';
import LoadingCard from './components/LoadingCard';
import ReportCard from './components/ReportCard';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'verify' | 'dashboard' | 'history' | 'settings'
  const [selectedModality, setSelectedModality] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errObj = result.error;
        let msg = 'Failed to complete verification query.';
        if (typeof errObj === 'string') {
          msg = errObj;
        } else if (errObj && typeof errObj === 'object') {
          msg = errObj.message || errObj.code || JSON.stringify(errObj);
        }
        throw new Error(msg);
      }

      setScanResult(result.data);
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred while reaching the verification server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setError(null);
  };

  const handleStartVerify = () => {
    setActiveTab('verify');
    handleReset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectModality = (type) => {
    setSelectedModality(type);
    setActiveTab('verify');
    handleReset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="clay-app-root">
      {/* Top Claymorphic Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="clay-main-content">
        {/* VIEW 1: HOME / LANDING */}
        {activeTab === 'landing' && (
          <LandingView
            onStartVerify={handleStartVerify}
            onSelectInputType={handleSelectModality}
          />
        )}

        {/* VIEW 2: VERIFY (DETECTOR) */}
        {activeTab === 'verify' && (
          <div className="verify-page-wrapper">
            <div className="verify-header-intro">
              <span className="clay-section-kicker">MULTIMODAL FACT-CHECKER</span>
              <h2 className="verify-page-title">Verify Content & Media</h2>
              <p className="verify-page-sub">
                Select your media format below. EeraFact will cross-examine web evidence, detect manipulation signals, and generate a verified credibility report.
              </p>
            </div>

            {error && (
              <div className="clay-error-alert-banner">
                <div className="alert-icon-avatar">
                  <AlertCircle size={22} />
                </div>
                <div className="alert-content-box">
                  <h4 className="alert-title">Verification Notice</h4>
                  <p className="alert-message">{error}</p>
                  {(error.includes('GEMINI_API_KEY') || error.includes('API key')) && (
                    <div className="alert-config-hint">
                      👉 Ensure your <code>.env</code> file contains: <code>GEMINI_API_KEY=your_key_here</code>
                    </div>
                  )}
                  <button
                    type="button"
                    className="clay-btn clay-btn-secondary clay-btn-sm"
                    onClick={handleReset}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <RefreshCw size={14} />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !scanResult && (
              <InputForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                defaultType={selectedModality}
              />
            )}

            {isLoading && <LoadingCard />}

            {!isLoading && scanResult && (
              <ReportCard data={scanResult} onReset={handleReset} />
            )}
          </div>
        )}

        {/* VIEW 3: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateVerify={handleStartVerify} />
        )}

        {/* VIEW 4: HISTORY */}
        {activeTab === 'history' && (
          <HistoryView onNavigateVerify={handleStartVerify} />
        )}

        {/* VIEW 5: SETTINGS & PRIVACY */}
        {activeTab === 'settings' && (
          <SettingsView onNavigateVerify={handleStartVerify} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="clay-global-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-brand-title">EeraFact</div>
            <div className="footer-brand-tag">Think. Verify. Trust.</div>
            <p className="footer-brand-desc">
              AI-powered multimodal fact-checking for the information you see, hear, and share.
            </p>
          </div>

          <div className="footer-links-group">
            <button type="button" className="footer-link-btn" onClick={() => setActiveTab('landing')}>
              Home
            </button>
            <button type="button" className="footer-link-btn" onClick={() => setActiveTab('verify')}>
              Verify
            </button>
            <button type="button" className="footer-link-btn" onClick={() => setActiveTab('dashboard')}>
              Analytics
            </button>
            <button type="button" className="footer-link-btn" onClick={() => setActiveTab('history')}>
              History
            </button>
            <button type="button" className="footer-link-btn" onClick={() => setActiveTab('settings')}>
              Privacy & Settings
            </button>
          </div>

          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} EeraFact Intelligence. Grounded in Truth.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
