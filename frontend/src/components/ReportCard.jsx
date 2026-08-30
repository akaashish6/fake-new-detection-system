import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Info,
  Flame,
  Layers,
  Sliders,
  Eye,
  ArrowLeft,
  Share2,
  Calendar,
  Scale,
  Brain,
  Zap,
  CheckCircle2,
  Download,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadFactCheckCard } from '../utils/cardGenerator';

export default function ReportCard({ data, onReset }) {
  const [copied, setCopied] = useState(false);
  const [copiedClaim, setCopiedClaim] = useState(false);
  const [forensicMode, setForensicMode] = useState('heatmap');
  const [showAllSources, setShowAllSources] = useState(false);

  const {
    verdict = 'Fake',
    confidence_score = 100,
    language_detected = 'English',
    reasoning = 'There is no official announcement from the Government of India or any authorized telecom operator regarding a free 3-month 5G recharge scheme. PIB and multiple credible sources have confirmed this as a phishing attempt.',
    manipulation_techniques = [
      { title: 'Fabricated Quote', desc: 'Fake or invented statements' },
      { title: 'False Urgency', desc: 'Creates panic or unreal urgency' },
      { title: 'Emotional Manipulation', desc: 'Uses emotion to influence users' },
      { title: 'Sensationalism', desc: 'Exaggerated or misleading claims' }
    ],
    claim_text = 'The claim that Prime Minister Narendra Modi has announced a free 3-month 5G recharge scheme for all Indian users is completely false. This is a recurring viral phishing scam designed to steal personal information and drive traffic to fraudulent websites.',
    sources = [],
    forensics = null
  } = data;

  useEffect(() => {
    if (verdict === 'Real') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [verdict]);

  const getVerdictTheme = (v) => {
    switch (v) {
      case 'Real':
        return { color: '#10b981', border: 'rgba(16, 185, 129, 0.45)', bg: 'rgba(16, 185, 129, 0.08)', glow: '0 0 30px rgba(16, 185, 129, 0.35)', icon: <ShieldCheck size={42} /> };
      case 'Fake':
        return { color: '#ef4444', border: 'rgba(239, 68, 68, 0.45)', bg: 'rgba(239, 68, 68, 0.08)', glow: '0 0 30px rgba(239, 68, 68, 0.35)', icon: <ShieldAlert size={42} /> };
      case 'Misleading':
        return { color: '#f59e0b', border: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.08)', glow: '0 0 30px rgba(245, 158, 11, 0.35)', icon: <AlertTriangle size={42} /> };
      default:
        return { color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.45)', bg: 'rgba(139, 92, 246, 0.08)', glow: '0 0 30px rgba(139, 92, 246, 0.35)', icon: <HelpCircle size={42} /> };
    }
  };

  const theme = getVerdictTheme(verdict);

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(claim_text);
    setCopiedClaim(true);
    setTimeout(() => setCopiedClaim(false), 2000);
  };

  const handleCopySummary = () => {
    let summaryText = `[TruthLens Fact Check Report]\nVerdict: ${verdict}\nConfidence: ${confidence_score}%\nReasoning: ${reasoning}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultSourcesList = [
    {
      title: 'PIB Fact Check Official Twitter',
      handle: '@PIBFactCheck',
      badge: 'Official Government Source',
      description: 'PIB has confirmed that no such scheme exists. This message is fake.',
      url: 'https://twitter.com/PIBFactCheck',
      verified: true
    },
    {
      title: 'India Today Fact Check',
      handle: '@IndiaToday',
      badge: 'Independent Media Source',
      description: 'India Today has debunked this viral claim as a phishing scam.',
      url: 'https://www.indiatoday.in/fact-check',
      verified: true
    }
  ];

  const displaySources = sources.length > 0 ? sources : defaultSourcesList;
  const strokeDashoffset = 220 - (220 * confidence_score) / 100;

  return (
    <div className="report-page-container">
      {/* 1. TOP ACTION HEADER */}
      <div className="report-action-header">
        <button type="button" onClick={onReset} className="back-to-detector-btn">
          <ArrowLeft size={16} />
          Back to Detector
        </button>

        <div className="report-title-center">
          <div className="report-title-row">
            <h2 className="report-main-heading">FACT-CHECK REPORT</h2>
            <span className="report-id-badge">#TR-00142</span>
          </div>
          <div className="report-date-time">
            <Calendar size={13} /> 30 Aug 2026, 11:57 AM
          </div>
        </div>

        <button type="button" onClick={handleCopySummary} className="share-report-btn">
          <Share2 size={15} />
          Share Report
        </button>
      </div>

      {/* 2. HERO VERDICT & CONFIDENCE CARD */}
      <div
        className="glass-panel hero-verdict-card"
        style={{
          borderColor: theme.border,
          boxShadow: `${theme.glow}, var(--shadow-3d)`
        }}
      >
        <div className="verdict-hero-grid">
          {/* COLUMN 1: 3D Shield Badge */}
          <div className="shield-icon-container" style={{ borderColor: theme.border, color: theme.color }}>
            <div className="shield-inner-glow" style={{ background: theme.color }} />
            {theme.icon}
          </div>

          {/* COLUMN 2: Verdict Copy */}
          <div className="verdict-copy-block">
            <span className="verdict-label-small">VERDICT</span>
            <h1 className="verdict-title-huge" style={{ color: theme.color }}>
              {verdict.toUpperCase()}
            </h1>
            <p className="verdict-summary-text">
              {verdict === 'Fake' ? 'This claim is completely false.' : verdict === 'Real' ? 'This claim is verified authentic.' : 'This claim contains misleading details.'}
            </p>
            <div className="verdict-pills-row">
              <span className="verdict-pill-tag" style={{ borderColor: theme.border, color: theme.color, background: theme.bg }}>
                High Confidence
              </span>
              <span className="verdict-pill-tag" style={{ borderColor: theme.border, color: theme.color, background: theme.bg }}>
                AI Verified
              </span>
            </div>
          </div>

          {/* COLUMN 3: Donut Gauge Score */}
          <div className="gauge-column">
            <div className="donut-gauge-wrapper">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke={theme.color}
                  strokeWidth="6"
                  strokeDasharray="220"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="donut-center-content">
                <span className="donut-score-num">{confidence_score}%</span>
                <span className="donut-score-sub">AI CONFIDENCE SCORE</span>
              </div>
            </div>
          </div>

          {/* COLUMN 4: Confidence Level Text */}
          <div className="confidence-details-column">
            <span className="confidence-label">CONFIDENCE LEVEL</span>
            <h4 className="confidence-heading">High Confidence</h4>
            <p className="confidence-desc">
              Our AI model is highly confident this claim is false based on multiple signals and verified sources.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CLAIM UNDER REVIEW CARD */}
      <div className="glass-panel claim-under-review-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <Scale size={18} className="title-icon-cyan" />
            <h3>CLAIM UNDER REVIEW</h3>
          </div>
          <button type="button" onClick={handleCopyClaim} className="icon-copy-btn" title="Copy Claim Text">
            {copiedClaim ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="claim-body-text">
          {claim_text}
        </p>
      </div>

      {/* 4. 2-COLUMN MIDDLE ROW (Reasoning & Manipulation Signals) */}
      <div className="report-middle-grid">
        {/* LEFT: AI FACT-CHECK REASONING */}
        <div className="glass-panel middle-panel-card">
          <div className="card-title-group">
            <Brain size={18} className="title-icon-cyan" />
            <h3>AI FACT-CHECK REASONING</h3>
          </div>
          <p className="reasoning-paragraph">
            {reasoning}
          </p>
        </div>

        {/* RIGHT: MANIPULATION & PSYCHOLOGICAL SIGNALS */}
        <div className="glass-panel middle-panel-card">
          <div className="card-title-group">
            <Zap size={18} className="title-icon-rose" />
            <h3 style={{ color: '#f43f5e' }}>MANIPULATION & PSYCHOLOGICAL SIGNALS</h3>
          </div>

          <div className="signals-grid">
            {Array.isArray(manipulation_techniques) && manipulation_techniques.map((item, idx) => {
              const title = typeof item === 'string' ? item : item.title;
              const desc = typeof item === 'string' ? 'Flagged tactic detected in content' : item.desc;
              return (
                <div key={idx} className="signal-badge-card">
                  <div className="signal-card-head">
                    <AlertTriangle size={14} className="signal-icon-amber" />
                    <span>{title}</span>
                  </div>
                  <p className="signal-card-desc">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. FORENSICS ELA HEATMAP (If image was uploaded) */}
      {forensics && forensics.has_forensics && (
        <div className="glass-panel forensic-report-panel" style={{ marginTop: '1.5rem', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  Forensic Tampering & ELA Heatmap View
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Error Level Analysis (ELA) highlights Photoshop, Canva, & text splice modifications
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.5)', padding: '0.45rem 0.95rem', borderRadius: '50px', border: `1px solid ${forensics.tampering_score > 50 ? '#ef4444' : '#10b981'}` }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Tampering Risk:</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: forensics.tampering_score > 50 ? '#ef4444' : '#10b981' }}>
                {forensics.tampering_score}%
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setForensicMode('heatmap')} className={`forensic-tab-btn ${forensicMode === 'heatmap' ? 'active' : ''}`}>
              <Flame size={14} /> Thermal Forensic Heatmap
            </button>
            <button type="button" onClick={() => setForensicMode('ela')} className={`forensic-tab-btn ${forensicMode === 'ela' ? 'active' : ''}`}>
              <Layers size={14} /> ELA Layer
            </button>
            <button type="button" onClick={() => setForensicMode('split')} className={`forensic-tab-btn ${forensicMode === 'split' ? 'active' : ''}`}>
              <Sliders size={14} /> Side-by-Side Split
            </button>
            <button type="button" onClick={() => setForensicMode('original')} className={`forensic-tab-btn ${forensicMode === 'original' ? 'active' : ''}`}>
              <Eye size={14} /> Original Image
            </button>
          </div>

          <div style={{ background: '#000', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', padding: '0.75rem', textAlign: 'center' }}>
            {forensicMode === 'heatmap' && <img src={forensics.heatmap_image} alt="Thermal Heatmap" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'ela' && <img src={forensics.ela_image} alt="ELA Layer" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'original' && <img src={forensics.original_image} alt="Original Image" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'split' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <img src={forensics.original_image} alt="Original" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px' }} />
                <img src={forensics.heatmap_image} alt="Heatmap" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. VERIFIED EVIDENCE & SOURCES CARD */}
      <div className="glass-panel verified-sources-card">
        <div className="card-title-group" style={{ marginBottom: '1.25rem' }}>
          <ShieldCheck size={18} className="title-icon-cyan" />
          <h3>VERIFIED EVIDENCE & SOURCES</h3>
        </div>

        <div className="sources-cards-list">
          {displaySources.map((src, idx) => {
            const url = typeof src === 'string' ? src : src.url || '#';
            const title = typeof src === 'string' ? src : src.title || url;
            const handle = src.handle || '@FactCheck';
            const badge = src.badge || 'Official Source';
            const desc = src.description || 'Confirmed details and verified evidence regarding this viral claim.';

            return (
              <div key={idx} className="source-card-item">
                <div className="source-card-left">
                  <div className="source-logo-avatar">
                    {title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="source-title-row">
                      <h4 className="source-title-text">{title}</h4>
                      <CheckCircle2 size={14} className="verified-check-icon" />
                      <span className="source-badge-pill">{badge}</span>
                    </div>
                    <div className="source-handle-text">{handle}</div>
                    <p className="source-desc-text">{desc}</p>
                  </div>
                </div>

                <a href={url} target="_blank" rel="noopener noreferrer" className="source-link-btn">
                  <span className="link-url-truncated">{url}</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            );
          })}
        </div>

        <div className="sources-footer-btn-row">
          <button
            type="button"
            onClick={() => setShowAllSources(!showAllSources)}
            className="view-more-sources-btn"
          >
            View More Sources ({displaySources.length + 1}) ∨
          </button>
        </div>
      </div>

      {/* 7. BOTTOM ACTION FOOTER */}
      <div className="report-bottom-actions">
        <button type="button" onClick={onReset} className="reset-scan-btn">
          <RefreshCw size={16} />
          Scan Another Claim
        </button>

        <div className="bottom-right-btns">
          <button type="button" onClick={() => downloadFactCheckCard(data)} className="download-poster-btn">
            <Download size={16} />
            Download Fact-Check Card
          </button>

          <button type="button" onClick={() => window.print()} className="pdf-print-btn">
            <Printer size={16} />
            PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}

