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
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 3D Ambient Lighting Orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-layout" style={{ position: 'relative' }}>
        {/* Left Cyber Matrix Grid Overlay */}
        <div className="cyber-grid-left" />

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

                  {/* RIGHT: TRUTHLENS IN ACTION & 3D GLOBE GRAPHIC */}
                  <div className="detector-sidebar-column">
                    {/* 3D Wireframe Globe & Shield Graphic */}
                    <div className="shield-globe-graphic">
                      <svg viewBox="0 0 400 400" className="globe-3d-svg">
                        <defs>
                          <filter id="neonCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>

                          <radialGradient id="globeAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                            <stop offset="45%" stopColor="rgba(29, 107, 243, 0.25)" />
                            <stop offset="100%" stopColor="rgba(3, 7, 18, 0)" />
                          </radialGradient>

                          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="50%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        {/* Background Globe Radial Glow */}
                        <circle cx="200" cy="200" r="170" fill="url(#globeAura)" />

                        {/* 3D Wireframe Globe Sphere Grid */}
                        <circle cx="200" cy="200" r="140" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" fill="none" />
                        <circle cx="200" cy="200" r="140" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="1" strokeDasharray="3 6" fill="none" />

                        {/* Latitude Ellipses */}
                        <ellipse cx="200" cy="200" rx="140" ry="35" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.2" fill="none" />
                        <ellipse cx="200" cy="200" rx="140" ry="75" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" fill="none" />
                        <ellipse cx="200" cy="200" rx="140" ry="115" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" fill="none" />

                        {/* Longitude Ellipses */}
                        <ellipse cx="200" cy="200" rx="35" ry="140" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.2" fill="none" />
                        <ellipse cx="200" cy="200" rx="75" ry="140" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" fill="none" />
                        <ellipse cx="200" cy="200" rx="115" ry="140" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" fill="none" />

                        {/* Tilted Neon Orbital Rings */}
                        <ellipse cx="200" cy="200" rx="175" ry="60" stroke="#38bdf8" strokeWidth="1.5" fill="none" transform="rotate(-25 200 200)" filter="url(#neonCyanGlow)" opacity="0.8" />
                        <ellipse cx="200" cy="200" rx="165" ry="50" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="4 8" fill="none" transform="rotate(35 200 200)" opacity="0.75" />

                        {/* Glowing Grid Node Dots & Stars */}
                        <circle cx="200" cy="60" r="3" fill="#38bdf8" filter="url(#neonCyanGlow)" />
                        <circle cx="200" cy="340" r="3" fill="#38bdf8" filter="url(#neonCyanGlow)" />
                        <circle cx="60" cy="200" r="3.5" fill="#38bdf8" filter="url(#neonCyanGlow)" />
                        <circle cx="340" cy="200" r="3.5" fill="#a855f7" filter="url(#neonCyanGlow)" />
                        <circle cx="105" cy="115" r="2.5" fill="#38bdf8" />
                        <circle cx="295" cy="115" r="3" fill="#38bdf8" filter="url(#neonCyanGlow)" />
                        <circle cx="105" cy="285" r="3" fill="#a855f7" />
                        <circle cx="295" cy="285" r="2.5" fill="#38bdf8" />
                        <circle cx="350" cy="140" r="2" fill="#ffffff" />
                        <circle cx="50" cy="260" r="2" fill="#ffffff" />

                        {/* FOREGROUND SHIELD EMBLEM */}
                        <path
                          d="M200 85 L270 125 V200 C270 255 200 295 200 295 C200 295 130 255 130 200 V125 Z"
                          stroke="url(#shieldGradient)"
                          strokeWidth="4"
                          fill="rgba(6, 12, 28, 0.88)"
                          filter="url(#neonCyanGlow)"
                        />
                        <path
                          d="M200 98 L258 133 V197 C258 244 200 279 200 279 C200 279 142 244 142 197 V133 Z"
                          stroke="rgba(56, 189, 248, 0.4)"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <path
                          d="M175 190 L192 207 L228 168"
                          stroke="#38bdf8"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          filter="url(#neonCyanGlow)"
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


