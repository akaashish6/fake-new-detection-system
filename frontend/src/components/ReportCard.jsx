import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Globe,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Flame,
  Layers,
  ShieldAlert,
  Info,
  Sliders,
  Sparkles,
  Download,
  Printer,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadFactCheckCard } from '../utils/cardGenerator';

export default function ReportCard({ data, onReset }) {
  const [copied, setCopied] = useState(false);
  const [forensicMode, setForensicMode] = useState('heatmap'); // 'heatmap' | 'ela' | 'original' | 'split'

  const {
    verdict = 'Unverifiable',
    confidence_score = 75,
    language_detected = 'English',
    reasoning = '',
    manipulation_techniques = [],
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

  const getVerdictIcon = (v) => {
    switch (v) {
      case 'Real':
        return <CheckCircle2 size={28} />;
      case 'Fake':
        return <AlertTriangle size={28} />;
      case 'Misleading':
        return <AlertCircle size={28} />;
      default:
        return <HelpCircle size={28} />;
    }
  };

  const getGaugeColor = (score, v) => {
    if (v === 'Real') return '#10b981';
    if (v === 'Fake') return '#ef4444';
    if (v === 'Misleading') return '#f59e0b';
    return '#8b5cf6';
  };

  const getTamperColor = (score) => {
    if (score >= 65) return '#ef4444'; // Red (High Tampering)
    if (score >= 35) return '#f59e0b'; // Amber (Moderate)
    return '#10b981'; // Green (Clean)
  };

  const handleCopySummary = () => {
    let summaryText = `[TruthLens Fact Check Report]\nVerdict: ${verdict}\nConfidence: ${confidence_score}%\nReasoning: ${reasoning}`;
    if (forensics && forensics.has_forensics) {
      summaryText += `\nImage Tampering Score: ${forensics.tampering_score}% (${forensics.tampering_level})`;
    }
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strokeDashoffset = 157 - (157 * confidence_score) / 100;

  return (
    <div className="glass-panel report-card" style={{ marginTop: '2rem' }}>
      {/* 1. Header & Confidence */}
      <div className="report-header">
        <div>
          <div className={`verdict-badge ${verdict.toLowerCase()}`}>
            {getVerdictIcon(verdict)}
            <span>{verdict}</span>
          </div>

          {language_detected && (
            <div style={{ marginTop: '0.75rem' }}>
              <span className="language-badge">
                <Globe size={14} />
                Language Context: {language_detected}
              </span>
            </div>
          )}
        </div>

        <div className="confidence-gauge">
          <div className="gauge-circle">
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle
                cx="27"
                cy="27"
                r="23"
                fill="transparent"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="27"
                cy="27"
                r="23"
                fill="transparent"
                stroke={getGaugeColor(confidence_score, verdict)}
                strokeWidth="4"
                strokeDasharray="157"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="gauge-text" style={{ color: getGaugeColor(confidence_score, verdict) }}>
              {confidence_score}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Confidence Score</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {confidence_score >= 80 ? 'High Confidence' : confidence_score >= 50 ? 'Moderate Confidence' : 'Low Confidence'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORENSIC IMAGE TAMPERING & ELA HEATMAP SECTION (When Image was analyzed) */}
      {forensics && forensics.has_forensics && (
        <div className="report-section" style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                  Forensic Tampering & ELA Heatmap View
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Error Level Analysis (ELA) highlights Photoshop, Canva, & text splice modifications
                </p>
              </div>
            </div>

            {/* Tampering Gauge Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.85rem', borderRadius: '50px', border: `1px solid ${getTamperColor(forensics.tampering_score)}` }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tampering Risk:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: getTamperColor(forensics.tampering_score) }}>
                {forensics.tampering_score}%
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getTamperColor(forensics.tampering_score), background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                {forensics.tampering_score > 65 ? 'MODIFIED' : forensics.tampering_score > 35 ? 'SUSPICIOUS' : 'CLEAN'}
              </span>
            </div>
          </div>

          {/* Forensic Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setForensicMode('heatmap')}
              style={{
                background: forensicMode === 'heatmap' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                color: forensicMode === 'heatmap' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Flame size={14} />
              Thermal Forensic Heatmap
            </button>
            <button
              type="button"
              onClick={() => setForensicMode('ela')}
              style={{
                background: forensicMode === 'ela' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                color: forensicMode === 'ela' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Layers size={14} />
              Error Level (ELA) Layer
            </button>
            <button
              type="button"
              onClick={() => setForensicMode('split')}
              style={{
                background: forensicMode === 'split' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                color: forensicMode === 'split' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Sliders size={14} />
              Side-by-Side Split View
            </button>
            <button
              type="button"
              onClick={() => setForensicMode('original')}
              style={{
                background: forensicMode === 'original' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                color: forensicMode === 'original' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Eye size={14} />
              Original Screenshot
            </button>
          </div>

          {/* Forensic Image Preview Container */}
          <div style={{ background: '#000', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden', padding: '0.5rem' }}>
            {forensicMode === 'heatmap' && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={forensics.heatmap_image}
                  alt="Forensic Thermal Heatmap"
                  style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '4px' }}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>🔵 Blue = Unaltered</span>
                  <span>🟢 Green = Minor Compression</span>
                  <span>🟡 Yellow/Red = <b style={{ color: '#ef4444' }}>Altered / Spliced Region</b></span>
                </div>
              </div>
            )}

            {forensicMode === 'ela' && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={forensics.ela_image}
                  alt="ELA Analysis View"
                  style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '4px' }}
                />
                <p style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Brighter glowing areas represent elements inserted or edited with different compression rates.
                </p>
              </div>
            )}

            {forensicMode === 'original' && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={forensics.original_image}
                  alt="Original Upload"
                  style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', borderRadius: '4px' }}
                />
              </div>
            )}

            {forensicMode === 'split' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    🖼️ Original Upload
                  </div>
                  <img
                    src={forensics.original_image}
                    alt="Original Upload"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '4px', background: '#090d16' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f87171', marginBottom: '0.35rem' }}>
                    🔥 Forensic Heatmap (Tampered Edits)
                  </div>
                  <img
                    src={forensics.heatmap_image}
                    alt="Thermal Heatmap"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '4px', background: '#090d16' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Forensic Explanation Note */}
          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <Info size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              <b>Forensic Finding:</b> {forensics.summary}
            </p>
          </div>
        </div>
      )}

      {/* 3. Reasoning Section */}
      <div className="report-section">
        <h4 className="section-title">
          <span>AI Fact Check Reasoning</span>
        </h4>
        <div className="reasoning-box">
          <p>{reasoning}</p>
        </div>
      </div>

      {/* 4. Flagged Manipulation Techniques */}
      {manipulation_techniques && manipulation_techniques.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">
            <span>Flagged Manipulation & Psychological Techniques</span>
          </h4>
          <div className="technique-tags">
            {manipulation_techniques.map((tech, idx) => (
              <div key={idx} className="technique-tag">
                <AlertTriangle size={14} />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Verification Sources */}
      {sources && sources.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">
            <span>Verified Sources & Grounding References</span>
          </h4>
          <div className="sources-list">
            {sources.map((src, idx) => {
              const url = typeof src === 'string' ? src : src.url || '#';
              const title = typeof src === 'string' ? src : src.title || url;
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-item"
                >
                  <span style={{ fontWeight: 500, wordBreak: 'break-all' }}>{title}</span>
                  <ExternalLink size={16} style={{ flexShrink: 0 }} />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Action Footer with WhatsApp Card & PDF Download */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onReset}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <RefreshCw size={16} />
          Scan Another Claim
        </button>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Download WhatsApp Fact-Check Poster Card */}
          <button
            type="button"
            onClick={() => downloadFactCheckCard(data)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Download size={16} />
            📥 Download WhatsApp Fact-Check Card
          </button>

          {/* Print / Save as PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '0.65rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <Printer size={16} />
            PDF Report
          </button>

          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
            {copied ? 'Copied Summary!' : 'Copy Summary'}
          </button>
        </div>
      </div>
    </div>
  );
}

