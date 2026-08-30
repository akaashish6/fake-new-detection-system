import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingCard from './components/LoadingCard';
import ReportCard from './components/ReportCard';
import HistoryView from './components/HistoryView';
import { AlertCircle, ShieldCheck, Target, Globe, Zap, FileText, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 3D Ambient Lighting Orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-layout">
        {activeTab === 'scan' ? (
          <>
            {/* HERO SECTION */}
            <div className="hero-section">
              <div className="hero-top-pill">
                <span>AI-POWERED MISINFORMATION INTELLIGENCE</span>
              </div>

              <h2 className="hero-title-main">
                VERIFY WHAT YOU SEE.
                <span className="hero-gradient-text-pink">DETECT WHAT OTHERS MISS.</span>
              </h2>

              <p className="hero-subtitle-ref">
                Verify claims, news URLs and media using advanced AI analysis, web grounding and forensic signals.
              </p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Fact Check Failed</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {error.includes('GEMINI_API_KEY') ? 'API Key configuration missing.' : error}
                  </div>
                  {(error.includes('GEMINI_API_KEY') || error.includes('API key')) && (
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#fed7aa', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(254, 215, 170, 0.3)' }}>
                      👉 Please configure your API key in the <code>.env</code> file: <code>GEMINI_API_KEY=your_key_here</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !scanResult && (
              <>
                {/* 2-COLUMN MAIN GRID */}
                <div className="detector-layout-grid">
                  {/* LEFT: MAIN FORM */}
                  <div className="detector-form-column">
                    <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                  </div>

                  {/* RIGHT: TRUTHLENS IN ACTION & 3D GRAPHIC */}
                  <div className="detector-sidebar-column">
                    {/* 3D Glowing Shield & Globe Background Graphic */}
                    <div className="shield-globe-graphic">
                      <svg viewBox="0 0 200 200" className="shield-svg">
                        <defs>
                          <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
                            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                          </radialGradient>
                          <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        {/* Outer Orbital Grid Rings */}
                        <ellipse cx="100" cy="100" rx="90" ry="40" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.2" fill="none" transform="rotate(-20 100 100)" />
                        <ellipse cx="100" cy="100" rx="85" ry="35" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="1" strokeDasharray="4 4" fill="none" transform="rotate(25 100 100)" />
                        <circle cx="100" cy="100" r="70" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" fill="url(#shieldGlow)" />

                        {/* Shield Badge */}
                        <path
                          d="M100 35 L145 60 V105 C145 138 100 162 100 162 C100 162 55 138 55 105 V60 Z"
                          stroke="url(#shieldBorderGrad)"
                          strokeWidth="3.5"
                          fill="rgba(10, 16, 32, 0.65)"
                          filter="drop-shadow(0 0 15px rgba(56, 189, 248, 0.5))"
                        />
                        {/* Checkmark */}
                        <path
                          d="M85 98 L96 109 L118 84"
                          stroke="#38bdf8"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          filter="drop-shadow(0 0 8px #38bdf8)"
                        />
                      </svg>
                    </div>

                    {/* TRUTHLENS IN ACTION Card */}
                    <div className="glass-panel sidebar-action-card">
                      <h4 className="sidebar-card-title">TRUTHLENS IN ACTION</h4>

                      <div className="sidebar-stats-list">
                        <div className="sidebar-stat-item">
                          <div className="stat-icon-box cyan">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <div className="stat-number">12,842+</div>
                            <div className="stat-text">Claims Analyzed</div>
                          </div>
                        </div>

                        <div className="sidebar-stat-item">
                          <div className="stat-icon-box rose">
                            <Target size={20} />
                          </div>
                          <div>
                            <div className="stat-number">98.7%</div>
                            <div className="stat-text">Accuracy Rate</div>
                          </div>
                        </div>

                        <div className="sidebar-stat-item">
                          <div className="stat-icon-box blue">
                            <Globe size={20} />
                          </div>
                          <div>
                            <div className="stat-number">250K+</div>
                            <div className="stat-text">Sources Verified</div>
                          </div>
                        </div>

                        <div className="sidebar-stat-item">
                          <div className="stat-icon-box purple">
                            <Zap size={20} />
                          </div>
                          <div>
                            <div className="stat-number">Real-time</div>
                            <div className="stat-text">Analysis Engine</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM SECTION: HOW TRUTHLENS WORKS */}
                <div id="how-it-works" className="how-it-works-container">
                  <div className="section-divider-title">
                    <span className="dot" />
                    <span className="divider-line" />
                    <h3 className="how-works-heading">HOW TRUTHLENS WORKS</h3>
                    <span className="divider-line" />
                    <span className="dot" />
                  </div>

                  <div className="how-works-grid">
                    <div className="work-step-card glass-panel">
                      <div className="step-num-badge">01</div>
                      <div className="step-body">
                        <div className="step-head">
                          <h5>INPUT</h5>
                          <FileText size={18} className="step-head-icon" />
                        </div>
                        <p>Paste claim, news URL, screenshot or audio.</p>
                      </div>
                    </div>

                    <div className="step-arrow-divider">
                      <ArrowRight size={20} />
                    </div>

                    <div className="work-step-card glass-panel">
                      <div className="step-num-badge">02</div>
                      <div className="step-body">
                        <div className="step-head">
                          <h5>AI ANALYSIS</h5>
                          <Cpu size={18} className="step-head-icon" />
                        </div>
                        <p>Our AI analyzes language, context, sources & forensics.</p>
                      </div>
                    </div>

                    <div className="step-arrow-divider">
                      <ArrowRight size={20} />
                    </div>

                    <div className="work-step-card glass-panel">
                      <div className="step-num-badge">03</div>
                      <div className="step-body">
                        <div className="step-head">
                          <h5>VERDICT & EVIDENCE</h5>
                          <CheckCircle2 size={18} className="step-head-icon" />
                        </div>
                        <p>Get verdict, confidence score and verified evidence.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
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


