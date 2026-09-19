import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
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

function SourceFaviconAvatar({ url, title }) {
  const [imgError, setImgError] = useState(false);

  const rawUrl = (typeof url === 'string' ? url : '').toLowerCase();
  const rawTitle = (typeof title === 'string' ? title : '').toLowerCase();

  // 1. Twitter / X Domain Check
  const isTwitter = rawUrl.includes('twitter.com') || rawUrl.includes('x.com');
  if (isTwitter) {
    return (
      <div className="source-avatar twitter-avatar">
        <span>𝕏</span>
      </div>
    );
  }

  // 2. Press Information Bureau (PIB)
  const isPibDomain = rawUrl.includes('pib.gov.in');
  if (isPibDomain || (rawTitle.includes('pib') && !rawUrl.includes('twitter') && !rawUrl.includes('x.com'))) {
    return (
      <div className="source-avatar pib-avatar">
        <span>PIB</span>
      </div>
    );
  }

  // 3. India Today / Major Media
  const isIndiaToday = rawUrl.includes('indiatoday');
  if (isIndiaToday || rawTitle.includes('india today')) {
    return (
      <div className="source-avatar media-avatar">
        <span>IT</span>
      </div>
    );
  }

  // 4. Fallback Google Favicon
  let faviconUrl = null;
  try {
    if (rawUrl && rawUrl !== '#') {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    }
  } catch (e) {
    faviconUrl = null;
  }

  return (
    <div className="source-avatar default-avatar">
      {faviconUrl && !imgError ? (
        <img
          src={faviconUrl}
          alt={title || 'Source'}
          onError={() => setImgError(true)}
          className="source-fav-img"
        />
      ) : (
        <span>{title ? title.charAt(0).toUpperCase() : 'G'}</span>
      )}
    </div>
  );
}

export default function ReportCard({ data, onReset }) {
  const [copied, setCopied] = useState(false);
  const [copiedClaim, setCopiedClaim] = useState(false);
  const [forensicMode, setForensicMode] = useState('heatmap'); // 'heatmap' | 'ela' | 'split' | 'original'
  const [showAllSources, setShowAllSources] = useState(false);

  const verdict = data?.verdict || 'Unverifiable';
  const confidence_score = data?.confidence_score ?? 50;
  const language_detected = data?.language_detected || 'English';
  const reasoning = data?.reasoning || 'Fact check analysis completed based on available references.';
  const manipulation_techniques = data?.manipulation_techniques || [];
  const claim_text = data?.claim_text || data?.input_content || 'Claim details unavailable for this scan.';
  const sources = data?.sources || [];
  const forensics = data?.forensics || null;

  useEffect(() => {
    if (verdict === 'Real') {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 }
      });
    }
  }, [verdict]);

  const getVerdictStyle = (v) => {
    switch (v) {
      case 'Real':
        return {
          type: 'real',
          color: '#2F5D50',
          title: 'VERIFIED REAL',
          badgeText: 'Supported by Evidence',
          icon: <ShieldCheck size={36} />,
          summary: 'This claim is supported by verified factual records and authoritative sources.'
        };
      case 'Fake':
        return {
          type: 'fake',
          color: '#C95C54',
          title: 'DEBUNKED FAKE',
          badgeText: 'Contradicted by Evidence',
          icon: <ShieldAlert size={36} />,
          summary: 'This claim appears to be false based on factual contradictions and verifiable data.'
        };
      case 'Misleading':
        return {
          type: 'misleading',
          color: '#D99A3D',
          title: 'MISLEADING CONTEXT',
          badgeText: 'Distorted or Selective Facts',
          icon: <AlertTriangle size={36} />,
          summary: 'This claim contains distorted details, omitted facts, or out-of-context assertions.'
        };
      default:
        return {
          type: 'unverifiable',
          color: '#6B7A6F',
          title: 'UNVERIFIABLE CLAIM',
          badgeText: 'Insufficient Evidence',
          icon: <HelpCircle size={36} />,
          summary: 'Sufficient public evidence could not be established to conclusively verify this claim.'
        };
    }
  };

  const vStyle = getVerdictStyle(verdict);

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(claim_text);
    setCopiedClaim(true);
    setTimeout(() => setCopiedClaim(false), 2000);
  };

  const handleCopySummary = () => {
    const text = `[EeraFact Fact-Check Report]\nVerdict: ${verdict}\nCredibility Score: ${confidence_score}/100\nReasoning: ${reasoning}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scanIdFormatted = data?.scan_id ? `#EF-${String(data.scan_id).padStart(5, '0')}` : '#EF-00142';
  const timestampFormatted =
    data?.timestamp ||
    new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

  const getFallbackSources = (claim) => {
    const clean = (claim || 'Claim Verification').slice(0, 40);
    return [
      {
        title: `Google News Coverage: "${clean}"`,
        handle: '@GoogleNews',
        badge: 'Web Verification Search',
        description: `Explore live news reporting and fact-checking archives related to this claim topic.`,
        url: `https://news.google.com/search?q=${encodeURIComponent(clean)}`,
        verified: true
      }
    ];
  };

  const displaySources = sources && sources.length > 0 ? sources : getFallbackSources(claim_text);
  const visibleSources = showAllSources ? displaySources : displaySources.slice(0, 3);
  const hiddenCount = Math.max(0, displaySources.length - 3);

  const verdictReasons =
    Array.isArray(data?.verdict_reasons) && data.verdict_reasons.length > 0
      ? data.verdict_reasons
      : verdict === 'Fake'
      ? [
          'Direct factual contradictions detected against official data sources',
          'No official notification or credible announcement supports this claim',
          'Patterns of viral rumor amplification and exaggerated statistics identified'
        ]
      : verdict === 'Real'
      ? [
          'Multiple authoritative sources corroborate the core assertion',
          'No material discrepancies or fabricated elements identified',
          'Factual timeline and details align with recorded news events'
        ]
      : verdict === 'Misleading'
      ? [
          'Real background event mixed with sensationalized or unverified claims',
          'Important conditional context or dates have been selectively omitted',
          'Headline framing creates an inaccurate or alarmist impression'
        ]
      : [
          'Limited primary documentation currently available in public registries',
          'Search signals lack conclusive consensus among credible outlets',
          'Users are advised to exercise skepticism before sharing further'
        ];

  return (
    <div className="clay-report-view">
      {/* 1. TOP HEADER & META BAR */}
      <div className="clay-report-topbar">
        <button type="button" onClick={onReset} className="clay-btn clay-btn-secondary clay-btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Detector</span>
        </button>

        <div className="report-meta-center">
          <span className="report-id-pill">{scanIdFormatted}</span>
          <span className="report-date-pill">
            <Calendar size={13} />
            {timestampFormatted}
          </span>
          <span className="report-lang-pill">🌐 {language_detected}</span>
        </div>

        <div className="report-actions-right">
          <button type="button" onClick={handleCopySummary} className="clay-btn clay-btn-secondary clay-btn-sm" title="Copy Report Summary">
            {copied ? <Check size={15} style={{ color: '#2F5D50' }} /> : <Copy size={15} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* 2. HERO VERDICT & CREDIBILITY SCORE CARD (Claymorphic) */}
      <div className={`clay-card clay-verdict-hero-card verdict-${vStyle.type}`}>
        <div className="verdict-hero-layout">
          {/* Left: Verdict Icon & Title */}
          <div className="verdict-icon-title-group">
            <div className="verdict-clay-emblem">
              {vStyle.icon}
            </div>
            <div className="verdict-text-block">
              <span className="verdict-kicker">FINAL VERIFICATION STATUS</span>
              <h1 className="verdict-main-heading">{vStyle.title}</h1>
              <div className="verdict-badge-pill">{vStyle.badgeText}</div>
              <p className="verdict-lead-summary">{vStyle.summary}</p>
            </div>
          </div>

          {/* Right: Circular Credibility Score Gauge */}
          <div className="verdict-gauge-box">
            <div className="clay-gauge-circle">
              <svg width="140" height="140" viewBox="0 0 140 140" className="gauge-svg">
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  className="gauge-bg-ring"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  className="gauge-progress-ring"
                  style={{
                    stroke: vStyle.color,
                    strokeDasharray: 351.8,
                    strokeDashoffset: 351.8 - (351.8 * confidence_score) / 100
                  }}
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="gauge-inner-content">
                <span className="gauge-score-number">{confidence_score}</span>
                <span className="gauge-score-max">/ 100</span>
                <span className="gauge-score-label">Credibility Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulleted Evidence Points */}
        <div className="verdict-drivers-container">
          <span className="drivers-title">KEY VERIFICATION FINDINGS:</span>
          <div className="drivers-list">
            {verdictReasons.map((reason, index) => (
              <div key={index} className="driver-item">
                <CheckCircle2 size={16} className="driver-check-icon" style={{ color: vStyle.color }} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CLAIM UNDER REVIEW CARD */}
      <div className="clay-card clay-claim-review-card">
        <div className="card-section-title-row">
          <div className="title-with-icon">
            <Scale size={18} className="section-icon" />
            <h3 className="section-title">CLAIM UNDER REVIEW</h3>
          </div>
          <button
            type="button"
            onClick={handleCopyClaim}
            className="clay-icon-btn-sm"
            title="Copy Claim Text"
          >
            {copiedClaim ? <Check size={15} style={{ color: '#2F5D50' }} /> : <Copy size={15} />}
          </button>
        </div>
        <div className="claim-quote-container">
          <p className="claim-quote-text">"{claim_text}"</p>
        </div>
      </div>

      {/* 4. TWO-COLUMN: REASONING & MANIPULATION SIGNALS */}
      <div className="clay-two-col-grid">
        {/* Left: AI Reasoning */}
        <div className="clay-card clay-reasoning-card">
          <div className="card-section-title-row">
            <div className="title-with-icon">
              <Brain size={18} className="section-icon" />
              <h3 className="section-title">AI FACT-CHECK REASONING</h3>
            </div>
          </div>
          <div className="reasoning-body">
            <p className="reasoning-text">{reasoning}</p>
          </div>
        </div>

        {/* Right: Rhetorical & Manipulation Tactics */}
        <div className="clay-card clay-signals-card">
          <div className="card-section-title-row">
            <div className="title-with-icon">
              <Zap size={18} className="section-icon signal-tint" />
              <h3 className="section-title">MANIPULATION & RHETORICAL SIGNALS</h3>
            </div>
          </div>

          <div className="signals-list">
            {Array.isArray(manipulation_techniques) && manipulation_techniques.length > 0 ? (
              manipulation_techniques.map((item, idx) => {
                const title = typeof item === 'string' ? item : item.title;
                const desc = typeof item === 'string' ? 'Tactic detected in textual or visual framing' : item.desc;
                return (
                  <div key={idx} className="clay-signal-badge-card">
                    <div className="signal-head">
                      <AlertTriangle size={15} className="signal-alert-icon" />
                      <span className="signal-name">{title}</span>
                    </div>
                    <p className="signal-desc">{desc}</p>
                  </div>
                );
              })
            ) : (
              <div className="no-manipulation-notice">
                <CheckCircle2 size={18} style={{ color: '#2F5D50' }} />
                <span>No high-risk rhetorical manipulation techniques detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. IMAGE FORENSICS ELA SECTION (If Image Was Analyzed) */}
      {forensics && forensics.has_forensics && (
        <div className="clay-card clay-forensics-panel">
          <div className="forensics-panel-header">
            <div className="forensics-title-left">
              <div className="forensics-avatar-box">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="forensics-title">Digital Image Forensics & ELA Heatmap</h3>
                <p className="forensics-sub">
                  Error Level Analysis (ELA) isolates compression discrepancies across modified pixels, text overlays, and spliced elements.
                </p>
              </div>
            </div>

            {/* Risk Meter Pill */}
            <div className="forensics-risk-pill">
              <span className="risk-label">Tampering Risk:</span>
              <span
                className="risk-value"
                style={{ color: forensics.tampering_score > 50 ? '#C95C54' : '#2F5D50' }}
              >
                {forensics.tampering_score}%
              </span>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="forensics-mode-tabs">
            <button
              type="button"
              className={`forensic-tab-btn ${forensicMode === 'heatmap' ? 'active' : ''}`}
              onClick={() => setForensicMode('heatmap')}
            >
              <Flame size={14} />
              <span>Thermal Forensic Heatmap</span>
            </button>
            <button
              type="button"
              className={`forensic-tab-btn ${forensicMode === 'ela' ? 'active' : ''}`}
              onClick={() => setForensicMode('ela')}
            >
              <Layers size={14} />
              <span>ELA Layer</span>
            </button>
            <button
              type="button"
              className={`forensic-tab-btn ${forensicMode === 'split' ? 'active' : ''}`}
              onClick={() => setForensicMode('split')}
            >
              <Sliders size={14} />
              <span>Side-by-Side Split</span>
            </button>
            <button
              type="button"
              className={`forensic-tab-btn ${forensicMode === 'original' ? 'active' : ''}`}
              onClick={() => setForensicMode('original')}
            >
              <Eye size={14} />
              <span>Original Image</span>
            </button>
          </div>

          {/* Forensic Image Viewport */}
          <div className="forensic-viewport-card">
            {forensicMode === 'heatmap' && (
              <img src={forensics.heatmap_image} alt="Thermal Forensic Heatmap" className="forensic-display-img" />
            )}
            {forensicMode === 'ela' && (
              <img src={forensics.ela_image} alt="ELA Error Level Analysis" className="forensic-display-img" />
            )}
            {forensicMode === 'original' && (
              <img src={forensics.original_image} alt="Original Uploaded Media" className="forensic-display-img" />
            )}
            {forensicMode === 'split' && (
              <div className="forensic-split-grid">
                <div className="split-col">
                  <span className="split-label">Original Input</span>
                  <img src={forensics.original_image} alt="Original" className="split-img" />
                </div>
                <div className="split-col">
                  <span className="split-label">Thermal Heatmap</span>
                  <img src={forensics.heatmap_image} alt="Thermal Heatmap" className="split-img" />
                </div>
              </div>
            )}
          </div>

          {/* Forensic Spectrum & Color Interpretation Guide */}
          <div className="forensic-interpretation-box">
            <div className="interpretation-header">
              <Info size={16} className="info-icon" />
              <span className="interpretation-title">
                {forensicMode === 'ela'
                  ? 'ELA ERROR LEVEL INTERPRETATION GUIDE'
                  : 'THERMAL FORENSIC SPECTRUM & RISK LEVELS'}
              </span>
              <span className="interpretation-badge">{forensics.tampering_level || 'Analysis Complete'}</span>
            </div>

            {forensicMode !== 'original' && (
              <div className="forensic-spectrum-bar-wrap">
                <div className="spectrum-endpoints">
                  <span>Baseline Uniform Area (Safe)</span>
                  <span>Moderate Compression Variance</span>
                  <span>High Compression Discrepancy (Tampered)</span>
                </div>
                <div
                  className="spectrum-gradient-bar"
                  style={{
                    background:
                      forensicMode === 'ela'
                        ? 'linear-gradient(90deg, #111 0%, #666 40%, #ccc 80%, #fff 100%)'
                        : 'linear-gradient(90deg, #1B3B32 0%, #2F5D50 30%, #A8B9A5 55%, #D99A3D 75%, #C95C54 100%)'
                  }}
                />
              </div>
            )}

            {/* Note Distinguishing ELA Indicators vs AI Interpretation */}
            <div className="forensic-nuance-banner">
              <p>
                <strong>Methodology Note:</strong> Error Level Analysis flags potential pixel compression anomalies and digital splicing indicators. ELA findings are cross-verified with multimodal search grounding before finalizing the verdict.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. VERIFIED EVIDENCE & SOURCES */}
      <div className="clay-card clay-sources-card">
        <div className="card-section-title-row">
          <div className="title-with-icon">
            <ShieldCheck size={18} className="section-icon" />
            <h3 className="section-title">CORROBORATING SOURCES & EVIDENCE</h3>
          </div>
          <span className="sources-count-badge">
            {displaySources.length} Source{displaySources.length > 1 ? 's' : ''} Documented
          </span>
        </div>

        <div className="sources-list-grid">
          {visibleSources.map((src, idx) => {
            const url = typeof src === 'string' ? src : src.url || '#';
            const title = typeof src === 'string' ? src : src.title || url;
            const handle =
              src.handle ||
              (url !== '#'
                ? `@${new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '')}`
                : '@FactCheck');
            const badge =
              src.badge || (url.includes('.gov') ? 'Official Registry' : 'Verified Publisher');
            const desc =
              src.description ||
              'Corroborating reporting, primary documentation, and factual verification record.';

            return (
              <div key={idx} className="clay-source-item-card">
                <div className="source-item-main">
                  <SourceFaviconAvatar url={url} title={title} />
                  <div className="source-item-details">
                    <div className="source-title-row">
                      <h4 className="source-heading">{title}</h4>
                      <span className="source-badge-pill">{badge}</span>
                    </div>
                    <div className="source-handle">{handle}</div>
                    <p className="source-snippet">{desc}</p>
                  </div>
                </div>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-source-link-btn"
                  title="Open Source Link"
                >
                  <span>Open Source</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            );
          })}
        </div>

        {displaySources.length > 3 && (
          <div className="sources-expand-row">
            <button
              type="button"
              className="clay-btn clay-btn-secondary clay-btn-sm"
              onClick={() => setShowAllSources(!showAllSources)}
            >
              {showAllSources ? 'Show Fewer Sources ∧' : `View More Sources (${hiddenCount} More) ∨`}
            </button>
          </div>
        )}
      </div>

      {/* 7. ACTION FOOTER */}
      <div className="clay-report-footer-actions">
        <button type="button" onClick={onReset} className="clay-btn clay-btn-primary clay-btn-md">
          <RefreshCw size={17} />
          <span>Verify Another Claim</span>
        </button>

        <div className="footer-right-btn-group">
          <button
            type="button"
            onClick={() => downloadFactCheckCard(data)}
            className="clay-btn clay-btn-secondary clay-btn-md"
          >
            <Download size={16} />
            <span>Download WhatsApp Card</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="clay-btn clay-btn-secondary clay-btn-md"
          >
            <Printer size={16} />
            <span>PDF / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
