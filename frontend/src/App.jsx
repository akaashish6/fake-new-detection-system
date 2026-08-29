import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingCard from './components/LoadingCard';
import ReportCard from './components/ReportCard';
import HistoryView from './components/HistoryView';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scan');
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
        throw new Error(result.error || 'Failed to complete fact check query.');
      }

      setScanResult(result.data);
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-layout">
        {activeTab === 'scan' ? (
          <>
            <div className="hero-section">
              <h2 className="hero-title">AI Fake News & Misinformation Detector</h2>
              <p className="hero-subtitle">
                Verify viral claims, news URLs, and screenshot forwards using Google Gemini 2.5 Flash with real-time Search Grounding.
              </p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Fact Check Failed</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{error}</div>
                  {error.includes('GEMINI_API_KEY') && (
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#fed7aa', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      👉 Please set your Google AI Studio key in the <code>.env</code> file: <code>GEMINI_API_KEY=your_key_here</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !scanResult && (
              <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            )}

            {isLoading && <LoadingCard />}

            {!isLoading && scanResult && (
              <ReportCard data={scanResult} onReset={handleReset} />
            )}
          </>
        ) : (
          <HistoryView />
        )}
      </main>
    </div>
  );
}
