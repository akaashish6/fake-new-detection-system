import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoadingCard() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Parsing input & detecting language context (English/Hindi/Hinglish)...',
    'Sending request to Google Gemini 2.5 Flash model...',
    'Performing real-time Google Search grounding & cross-referencing...',
    'Detecting manipulation techniques & synthesizing verdict report...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="glass-panel loading-card" style={{ marginTop: '2rem' }}>
      <div className="pulse-loader">
        <Cpu size={32} />
      </div>

      <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Analyzing Claim with Gemini AI
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Fact-checking news, logical context, and cross-referencing web sources...
      </p>

      <div className="loading-steps">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`loading-step ${idx <= currentStep ? 'active' : ''}`}
          >
            {idx < currentStep ? (
              <CheckCircle2 size={18} style={{ color: 'var(--verdict-real)', flexShrink: 0 }} />
            ) : idx === currentStep ? (
              <Loader2 size={18} className="spin-icon" style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--border-color)', flexShrink: 0 }} />
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
