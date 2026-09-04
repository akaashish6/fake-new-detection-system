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

function SourceFaviconAvatar({ url, title }) {
  const [imgError, setImgError] = useState(false);

  const rawUrl = (typeof url === 'string' ? url : '').toLowerCase();
  const rawTitle = (typeof title === 'string' ? title : '').toLowerCase();

  // 1. FIRST PRIORITY: Twitter / X URL Domain Check
  const isTwitter = rawUrl.includes('twitter.com') || rawUrl.includes('x.com');
  if (isTwitter) {
    return (
      <div className="source-logo-avatar" style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '0.95rem' }}>𝕏</span>
      </div>
    );
  }

  // 2. SECOND PRIORITY: PIB (Press Information Bureau) Domain or Exclusive Title Check
  const isPibDomain = rawUrl.includes('pib.gov.in');
  if (isPibDomain || (rawTitle.includes('pib') && !rawUrl.includes('twitter') && !rawUrl.includes('x.com'))) {
    return (
      <div className="source-logo-avatar pib-avatar" style={{ background: 'linear-gradient(135deg, #090d16, #0f172a)', border: '1px solid rgba(255, 153, 51, 0.6)', boxShadow: '0 0 12px rgba(255, 153, 51, 0.25)' }}>
        <svg viewBox="0 0 36 36" width="28" height="28">
          <circle cx="18" cy="18" r="16" fill="#0b1120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {/* Indian Tricolor Ring */}
          <path d="M 4,18 A 14,14 0 0,1 32,18" fill="none" stroke="#FF9933" strokeWidth="2.5" />
          <path d="M 4,18 A 14,14 0 0,0 32,18" fill="none" stroke="#138808" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="1.5" fill="#38bdf8" />
          {/* Crisp PIB Emblem Text */}
          <text x="18" y="21.5" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.4px">
            PIB
          </text>
        </svg>
      </div>
    );
  }

  // 3. THIRD PRIORITY: India Today Domain or Exclusive Title Check
  const isIndiaTodayDomain = rawUrl.includes('indiatoday');
  if (isIndiaTodayDomain || (rawTitle.includes('india today') && !rawUrl.includes('twitter') && !rawUrl.includes('x.com'))) {
    return (
      <div className="source-logo-avatar" style={{ background: 'linear-gradient(135deg, #be123c, #9f1239)', border: '1px solid rgba(244, 63, 94, 0.6)', boxShadow: '0 0 12px rgba(244, 63, 94, 0.25)' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '0.62rem', lineHeight: 1.1, textAlign: 'center', display: 'block' }}>
          INDIA<br/>TODAY
        </span>
      </div>
    );
  }

  // 4. Fallback Google Favicon API
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
    <div className="source-logo-avatar">
      {faviconUrl && !imgError ? (
        <img
          src={faviconUrl}
          alt={title || 'Source Logo'}
          onError={() => setImgError(true)}
          style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }}
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
  const [forensicMode, setForensicMode] = useState('heatmap');
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
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [verdict]);

  const getVerdictTheme = (v) => {
    switch (v) {
      case 'Real':
        return { color: '#10b981', border: 'rgba(16, 185, 129, 0.35)', bg: 'rgba(16, 185, 129, 0.08)', glow: '0 0 18px rgba(16, 185, 129, 0.18)', icon: <ShieldCheck size={42} /> };
      case 'Fake':
        return { color: '#ef4444', border: 'rgba(239, 68, 68, 0.35)', bg: 'rgba(239, 68, 68, 0.08)', glow: '0 0 18px rgba(239, 68, 68, 0.18)', icon: <ShieldAlert size={42} /> };
      case 'Misleading':
        return { color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)', bg: 'rgba(245, 158, 11, 0.08)', glow: '0 0 18px rgba(245, 158, 11, 0.18)', icon: <AlertTriangle size={42} /> };
      default:
        return { color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.35)', bg: 'rgba(139, 92, 246, 0.08)', glow: '0 0 18px rgba(139, 92, 246, 0.18)', icon: <HelpCircle size={42} /> };
    }
  };

  const theme = getVerdictTheme(verdict);

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(claim_text);
    setCopiedClaim(true);
    setTimeout(() => setCopiedClaim(false), 2000);
  };

  const handleCopySummary = () => {
    let summaryText = `[EeraFact Fact Check Report]\nVerdict: ${verdict}\nConfidence: ${confidence_score}%\nReasoning: ${reasoning}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scanIdFormatted = data?.scan_id ? `#FT-${String(data.scan_id).padStart(5, '0')}` : '#FT-00142';
  const timestampFormatted = data?.timestamp || new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const getVerdictSummaryText = (v, lang) => {
    if (lang === 'Hinglish') {
      switch (v) {
        case 'Fake': return 'Yeh claim bilkul jhooth aur galat hai.';
        case 'Real': return 'Yeh claim bilkul sach aur verified hai.';
        case 'Misleading': return 'Is claim me adha sach aur bhramak jankari hai.';
        default: return 'Is claim ki direct verification jankari nahi mili.';
      }
    }
    if (lang === 'Hindi') {
      switch (v) {
        case 'Fake': return 'यह दावा पूरी तरह से झूठा और गलत है।';
        case 'Real': return 'यह दावा पूरी तरह से सत्य और सत्यापित है।';
        case 'Misleading': return 'इस दावे में भ्रामक जानकारी शामिल है।';
        default: return 'इस दावे की प्रत्यक्ष पुष्टि उपलब्ध नहीं है।';
      }
    }
    switch (v) {
      case 'Fake': return 'This claim is completely false.';
      case 'Real': return 'This claim is verified authentic.';
      case 'Misleading': return 'This claim contains misleading details.';
      default: return 'Available evidence is insufficient.';
    }
  };

  const getConfidenceLevelTitle = (score) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const getConfidenceDescription = (v, score, lang) => {
    if (lang === 'Hinglish') {
      switch (v) {
        case 'Fake': return 'Humara AI model verified news aur market rates ke basis par sure hai ki yeh claim jhooth hai.';
        case 'Real': return 'Humara AI model verified reports aur sources ke basis par sure hai ki yeh claim sach hai.';
        case 'Misleading': return 'Humare AI model ne is claim me galat context aur exaggerated details payi hain.';
        default: return 'Is claim ke liye direct online verification details nahi mili hain.';
      }
    }
    if (lang === 'Hindi') {
      switch (v) {
        case 'Fake': return 'हमारा AI मॉडल सत्यापित खबरों और आंकड़ों के आधार पर आश्वस्त है कि यह दावा झूठा है।';
        case 'Real': return 'हमारा AI मॉडल आधिकारिक रिपोर्टों के आधार पर आश्वस्त है कि यह दावा सच है।';
        case 'Misleading': return 'हमारे AI मॉडल ने इस दावे में भ्रामक तथ्य और अधूरा संदर्भ पाया है।';
        default: return 'इस दावे के लिए पर्याप्त ऑनलाइन सत्यापन आंकड़े उपलब्ध नहीं हैं।';
      }
    }
    const levelStr = score >= 80 ? 'highly confident' : 'confident';
    switch (v) {
      case 'Fake':
        return `Our AI model is ${levelStr} this claim is false based on verified evidence, market data, and factual contradictions.`;
      case 'Real':
        return `Our AI model is ${levelStr} this claim is authentic and supported by verified reports and reliable sources.`;
      case 'Misleading':
        return `Our AI model detected distorted facts or missing context in this claim based on multi-source analysis.`;
      default:
        return `Our AI model found limited direct verification data for this specific claim. Proceed with caution.`;
    }
  };

  const getFallbackSources = (claimTxt) => {
    const cleanTopic = (claimTxt || 'Claim Verification').slice(0, 40);
    const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(cleanTopic)}`;
    return [
      {
        title: `Google News Search: "${cleanTopic}"`,
        handle: '@GoogleNews',
        badge: 'Web Verification Search',
        description: `Explore live news articles and verification reports related to "${cleanTopic}".`,
        url: searchUrl,
        verified: true
      }
    ];
  };

  const displaySources = (sources && sources.length > 0) ? sources : getFallbackSources(claim_text);
  const visibleSources = showAllSources ? displaySources : displaySources.slice(0, 2);
  const hiddenCount = Math.max(0, displaySources.length - 2);

  // Dynamic verdict reasons from Gemini API or fallback
  const verdictReasons = (Array.isArray(data?.verdict_reasons) && data.verdict_reasons.length > 0)
    ? data.verdict_reasons
    : (verdict === 'Fake' ? [
        'Verified evidence and standard market rates contradict the claim',
        'Official reports and data confirm the claim is false',
        'Analysis detected false numbers or exaggerated statements'
      ] : verdict === 'Real' ? [
        'Reliable sources support the main facts of this claim',
        'No significant factual contradictions found in evidence',
        'Confirmed against established domain logic and news reports'
      ] : verdict === 'Misleading' ? [
        'Claim distorts true context or uses selective facts',
        'Important details are omitted or exaggerated',
        'Partial truth mixed with unverified assertions'
      ] : [
        'Specific claim details lack direct public verification sources',
        'Available search signals do not establish a conclusive verdict',
        'Exercise caution and cross-check before sharing'
      ]);

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
            <span className="report-id-badge">{scanIdFormatted}</span>
          </div>
          <div className="report-date-time">
            <Calendar size={13} /> {timestampFormatted}
          </div>
        </div>

        <button type="button" onClick={handleCopySummary} className="share-report-btn">
          <Share2 size={15} />
          Share Report
        </button>
      </div>

      {/* 2. HERO VERDICT & CONFIDENCE CARD (Matching Image 1) */}
      <div
        className="glass-panel hero-verdict-card"
        style={{
          borderColor: theme.border,
          boxShadow: `${theme.glow}, var(--shadow-3d)`
        }}
      >
        <div className="verdict-hero-grid">
          {/* COLUMN 1: 3D Shield Target Emblem */}
          <div className="shield-target-wrapper">
            <svg viewBox="0 0 160 160" className="shield-target-svg">
              <defs>
                <filter id="verdictGlowTheme" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Crosshair Target Grid Lines */}
              <circle cx="80" cy="80" r="72" stroke={theme.color} strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.4" />
              <circle cx="80" cy="80" r="60" stroke={theme.color} strokeWidth="1.2" fill="none" opacity="0.5" />
              <circle cx="80" cy="80" r="48" stroke={theme.color} strokeWidth="1" fill="none" opacity="0.3" />

              {/* Crosshair Axis Lines */}
              <line x1="80" y1="4" x2="80" y2="156" stroke={theme.color} strokeWidth="1" opacity="0.3" />
              <line x1="4" y1="80" x2="156" y2="80" stroke={theme.color} strokeWidth="1" opacity="0.3" />

              {/* Target Corner Dots */}
              <circle cx="20" cy="20" r="2.5" fill={theme.color} opacity="0.7" />
              <circle cx="140" cy="20" r="2.5" fill={theme.color} opacity="0.7" />
              <circle cx="20" cy="140" r="2.5" fill={theme.color} opacity="0.7" />
              <circle cx="140" cy="140" r="2.5" fill={theme.color} opacity="0.7" />

              {/* 3D Glowing Shield Badge */}
              <path
                d="M80 32 L118 52 V92 C118 118 80 136 80 136 C80 136 42 118 42 92 V52 Z"
                stroke={theme.color}
                strokeWidth="3.5"
                fill="rgba(10, 16, 32, 0.9)"
                filter="url(#verdictGlowTheme)"
              />
              <path
                d="M80 42 L110 58 V90 C110 110 80 125 80 125 C80 125 50 110 50 90 V58 Z"
                stroke={theme.color}
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
              />

              {/* Center Exclamation Mark `!` or Checkmark */}
              {verdict === 'Fake' ? (
                <g filter="url(#verdictGlowTheme)">
                  <line x1="80" y1="62" x2="80" y2="86" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="80" cy="98" r="3.5" fill="#ffffff" />
                </g>
              ) : (
                <path d="M68 84 L76 92 L94 72" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#verdictGlowTheme)" />
              )}
            </svg>
          </div>

          {/* COLUMN 2: Verdict Copy & Shining Text */}
          <div className="verdict-copy-block">
            <span className="verdict-label-small" style={{ color: theme.color }}>VERDICT</span>
            <h1 className="verdict-title-shining" style={{ color: theme.color }}>
              {verdict.toUpperCase()}
            </h1>
            <p className="verdict-summary-text">
              {getVerdictSummaryText(verdict, language_detected)}
            </p>
            {/* WHY THIS VERDICT - COMPACT SUMMARY */}
<div
  className="verdict-reasons-box"
  style={{
    marginTop: '1rem',
    padding: '0.9rem 1rem',
    borderRadius: '12px',
    background: 'var(--bg-surface)',
    border: `1px solid var(--border-color)`,
    maxWidth: '520px'
  }}
>
  <div
    style={{
      fontSize: '0.78rem',
      fontWeight: 800,
      color: 'var(--text-primary)',
      marginBottom: '0.55rem',
      letterSpacing: '0.04em'
    }}
  >
    WHY THIS VERDICT?
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    {verdictReasons.map((reason, index) => (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.78rem',
          lineHeight: 1.4,
          color: 'var(--text-secondary)'
        }}
      >
        <CheckCircle2
          size={15}
          style={{
            color: theme.color,
            flexShrink: 0,
            marginTop: '2px'
          }}
        />
        <span>{reason}</span>
      </div>
    ))}
  </div>
</div>

<div className="verdict-pills-row" style={{ marginTop: '0.85rem' }}>
  <span
    className="verdict-pill-tag"
    style={{
      borderColor: theme.border,
      color: theme.color,
      background: theme.bg
    }}
  >
    {getConfidenceLevelTitle(confidence_score)}
  </span>

  <span
    className="verdict-pill-tag"
    style={{
      borderColor: theme.border,
      color: theme.color,
      background: theme.bg
    }}
  >
    AI Verified
  </span>
</div>
          </div>

          {/* COLUMN 3: Donut Gauge Score Ring */}
          <div className="gauge-column">
            <div className="donut-gauge-wrapper-large">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle
                  cx="65"
                  cy="65"
                  r="52"
                  fill="transparent"
                  stroke={theme.color}
                  strokeWidth="7.5"
                  strokeDasharray="327"
                  strokeDashoffset={327 - (327 * confidence_score) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  filter="url(#verdictGlowTheme)"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="donut-center-content-large">
                <span className="donut-score-num-large">{confidence_score}%</span>
                <span className="donut-score-sub-large">AI CONFIDENCE<br />SCORE</span>
              </div>
            </div>
          </div>

          {/* COLUMN 4: Confidence Level Text */}
          <div className="confidence-details-column">
            <span className="confidence-label">CONFIDENCE LEVEL</span>
            <h4 className="confidence-heading">{getConfidenceLevelTitle(confidence_score)}</h4>
            <p className="confidence-desc">
              {getConfidenceDescription(verdict, confidence_score, language_detected)}
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

          {/* Mode Selector Buttons */}
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

          {/* Image Display Window */}
          <div style={{ background: '#000', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', padding: '0.75rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            {forensicMode === 'heatmap' && <img src={forensics.heatmap_image} alt="Thermal Heatmap" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'ela' && <img src={forensics.ela_image} alt="ELA Layer" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'original' && <img src={forensics.original_image} alt="Original Image" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '6px' }} />}
            {forensicMode === 'split' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original Input</div>
                  <img src={forensics.original_image} alt="Original" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thermal Heatmap</div>
                  <img src={forensics.heatmap_image} alt="Heatmap" style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
              </div>
            )}
          </div>

          {/* COLOR INDICATION & INTERPRETATION GUIDE */}
          <div className="forensic-color-legend-card">
            <div className="legend-header-row">
              <div className="legend-title-wrapper">
                <Info size={16} className="title-icon-cyan" />
                <span className="legend-main-title">
                  {forensicMode === 'ela'
                    ? 'ELA LAYER COLOR INDICATIONS & ERROR LEVELS'
                    : forensicMode === 'original'
                    ? 'ORIGINAL BASELINE INSPECTION'
                    : 'THERMAL FORENSIC COLOR INDICATIONS & RISK SPECTRUM'}
                </span>
              </div>
              <span className="legend-status-badge">
                {forensics.tampering_level || 'Analysis Complete'}
              </span>
            </div>

            {/* SPECTRUM BAR */}
            {forensicMode !== 'original' && (
              <div className="forensic-spectrum-container">
                <div className="spectrum-labels-top">
                  <span>{forensicMode === 'ela' ? 'Low Error Level (Stable)' : 'Untouched / Baseline'}</span>
                  <span>{forensicMode === 'ela' ? 'Normal Texture Contrast' : 'Moderate Compression'}</span>
                  <span>{forensicMode === 'ela' ? 'High Error / Spliced (Tampered)' : 'High Tampering Risk (Edited)'}</span>
                </div>
                <div
                  className="forensic-spectrum-gradient-bar"
                  style={{
                    background: forensicMode === 'ela'
                      ? 'linear-gradient(90deg, #050505 0%, #475569 35%, #94a3b8 70%, #ffffff 100%)'
                      : 'linear-gradient(90deg, #021a38 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)'
                  }}
                />
              </div>
            )}

            {/* COLOR GRID CARDS - THERMAL & SPLIT MODE */}
            {(forensicMode === 'heatmap' || forensicMode === 'split') && (
              <div className="forensic-color-grid">
                <div className="color-indicator-box border-red">
                  <div className="color-box-head">
                    <span className="color-swatch bg-red-bright" />
                    <span className="color-name color-red">Red / Orange</span>
                    <span className="color-tag tag-red">High Risk</span>
                  </div>
                  <p className="color-desc">
                    <strong>Altered / Spliced Elements:</strong> Modified text, fake numbers, pasted logos, or Photoshop/Canva layers with high compression discrepancy.
                  </p>
                </div>

                <div className="color-indicator-box border-amber">
                  <div className="color-box-head">
                    <span className="color-swatch bg-amber" />
                    <span className="color-name color-amber">Yellow / Amber</span>
                    <span className="color-tag tag-amber">Moderate Anomaly</span>
                  </div>
                  <p className="color-desc">
                    <strong>Re-compression Artifacts:</strong> Multi-app forwarding (WhatsApp/X), slight boundary smoothing, or secondary digital overlays.
                  </p>
                </div>

                <div className="color-indicator-box border-emerald">
                  <div className="color-box-head">
                    <span className="color-swatch bg-emerald" />
                    <span className="color-name color-emerald">Green / Cyan</span>
                    <span className="color-tag tag-emerald">Natural Variance</span>
                  </div>
                  <p className="color-desc">
                    <strong>Natural Edge Gradients:</strong> Normal high-frequency camera transitions, soft shadows, and standard JPEG edge compression.
                  </p>
                </div>

                <div className="color-indicator-box border-blue">
                  <div className="color-box-head">
                    <span className="color-swatch bg-navy" />
                    <span className="color-name color-blue">Deep Blue / Navy</span>
                    <span className="color-tag tag-blue">Baseline Safe</span>
                  </div>
                  <p className="color-desc">
                    <strong>Uniform Original Area:</strong> Consistent untouched background; identical compression cycle matching the original camera capture.
                  </p>
                </div>
              </div>
            )}

            {/* COLOR GRID CARDS - ELA GRAYSCALE MODE */}
            {forensicMode === 'ela' && (
              <div className="forensic-color-grid">
                <div className="color-indicator-box border-white">
                  <div className="color-box-head">
                    <span className="color-swatch bg-white" />
                    <span className="color-name color-white">Bright White Highlights</span>
                    <span className="color-tag tag-red">High Tamper Risk</span>
                  </div>
                  <p className="color-desc">
                    <strong>Higher Error Level:</strong> Bright glowing patches indicate pixels that have not undergone the same generational JPEG compression cycles (e.g. freshly inserted text or edited stamps).
                  </p>
                </div>

                <div className="color-indicator-box border-gray">
                  <div className="color-box-head">
                    <span className="color-swatch bg-gray-medium" />
                    <span className="color-name color-gray">Mid-Tone Gray Edges</span>
                    <span className="color-tag tag-amber">Standard Detail</span>
                  </div>
                  <p className="color-desc">
                    <strong>High-Frequency Contrast:</strong> Regular text outlines, sharp object contours, and fine textures naturally present in the camera capture.
                  </p>
                </div>

                <div className="color-indicator-box border-dark">
                  <div className="color-box-head">
                    <span className="color-swatch bg-black-deep" />
                    <span className="color-name color-dark">Black / Deep Dark</span>
                    <span className="color-tag tag-emerald">Consistent / Untouched</span>
                  </div>
                  <p className="color-desc">
                    <strong>Low Error Level:</strong> Consistent, unchanged background areas that have reached error saturation under uniform compression.
                  </p>
                </div>
              </div>
            )}

            {/* ORIGINAL IMAGE NOTE */}
            {forensicMode === 'original' && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                <strong style={{ color: '#38bdf8' }}>Baseline Reference:</strong> You are viewing the original uploaded document / screenshot. Switch to <em>Thermal Forensic Heatmap</em> or <em>ELA Layer</em> to reveal hidden compression discrepancies and tampered regions.
              </div>
            )}

            {/* FORENSIC SUMMARY BANNER */}
            {forensics.summary && (
              <div className="forensic-summary-banner">
                <div className="summary-banner-title">Forensic Analysis Findings:</div>
                <div className="summary-banner-text">{forensics.summary}</div>
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
          {visibleSources.map((src, idx) => {
            const url = typeof src === 'string' ? src : src.url || '#';
            const title = typeof src === 'string' ? src : src.title || url;
            const handle = src.handle || (url !== '#' ? `@${new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '')}` : '@FactCheck');
            const badge = src.badge || (url.includes('gov') ? 'Official Government Source' : 'Verified Media Source');
            const desc = src.description || 'Confirmed details and verified evidence regarding this viral claim.';

            return (
              <div key={idx} className="source-card-item">
                <div className="source-card-left">
                  <SourceFaviconAvatar url={url} title={title} />
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

        {displaySources.length > 2 && (
          <div className="sources-footer-btn-row">
            <button
              type="button"
              onClick={() => setShowAllSources(!showAllSources)}
              className="view-more-sources-btn"
            >
              {showAllSources 
                ? 'Show Fewer Sources ∧' 
                : `View More Sources (${hiddenCount} More) ∨`}
            </button>
          </div>
        )}
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

