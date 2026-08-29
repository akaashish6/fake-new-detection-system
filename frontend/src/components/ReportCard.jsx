import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, AlertCircle, ExternalLink, Globe, Copy, Check, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReportCard({ data, onReset }) {
  const [copied, setCopied] = useState(false);

  const { verdict, confidence_score, language_detected, reasoning, manipulation_techniques, sources } = data;

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

  const handleCopySummary = () => {
    const summaryText = `[TruthLens Fact Check Report]\nVerdict: ${verdict}\nConfidence: ${confidence_score}%\nReasoning: ${reasoning}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strokeDashoffset = 157 - (157 * confidence_score) / 100;

  return (
    <div className="glass-panel report-card" style={{ marginTop: '2rem' }}>
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

      {/* Reasoning Section */}
      <div className="report-section">
        <h4 className="section-title">
          <span>AI Fact Check Reasoning</span>
        </h4>
        <div className="reasoning-box">
          <p>{reasoning}</p>
        </div>
      </div>

      {/* Flagged Manipulation Techniques */}
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

      {/* Verification Sources */}
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

      {/* Action Footer */}
      <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onReset}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
        >
          <RefreshCw size={16} />
          Scan Another Claim
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', color: 'var(--accent-cyan)', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied Summary!' : 'Copy Summary'}
        </button>
      </div>
    </div>
  );
}
