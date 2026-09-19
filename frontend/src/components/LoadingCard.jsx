import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Globe,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';

export default function LoadingCard() {
  const [currentStep, setCurrentStep] = useState(0);

  const pipelineSteps = [
    {
      label: 'CONTENT RECEIVED',
      desc: 'Ingesting multimodal payload (text / link / screenshot / audio)',
      icon: <Layers size={18} />
    },
    {
      label: 'LANGUAGE DETECTED',
      desc: 'Identifying vernacular syntax (English, Hindi, or Hinglish)',
      icon: <FileText size={18} />
    },
    {
      label: 'CLAIM EXTRACTED',
      desc: 'Isolating factual assertions and quantifiable claims',
      icon: <Scale size={18} />
    },
    {
      label: 'WEB EVIDENCE RETRIEVED',
      desc: 'Querying live search grounding & newsroom archives',
      icon: <Globe size={18} />
    },
    {
      label: 'SOURCES CROSS-CHECKED',
      desc: 'Comparing claim against established fact-checks & reports',
      icon: <Search size={18} />
    },
    {
      label: 'AI MULTI-SIGNAL ANALYSIS',
      desc: 'Evaluating tampering signals, emotional framing & contradictions',
      icon: <Brain size={18} />
    },
    {
      label: 'FINAL VERDICT SYNTHESIS',
      desc: 'Calculating confidence index & generating verification report',
      icon: <ShieldCheck size={18} />
    }
  ];

  const statusMessages = [
    'Parsing input and identifying language context...',
    'Extracting the core factual assertions...',
    'Searching for primary web evidence & source documents...',
    'Cross-referencing news portals and verified repositories...',
    'Analyzing credibility, context, and rhetorical signals...',
    'Synthesizing final verdict and structuring evidence report...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < pipelineSteps.length - 1 ? prev + 1 : prev));
    }, 650);
    return () => clearInterval(timer);
  }, [pipelineSteps.length]);

  return (
    <div className="clay-card clay-loading-pipeline-card">
      {/* Loading Header */}
      <div className="pipeline-header">
        <div className="pipeline-spinner-badge">
          <Loader2 size={26} className="pipeline-spin-icon" />
        </div>
        <div className="pipeline-title-group">
          <span className="pipeline-kicker">VERIFICATION IN PROGRESS</span>
          <h3 className="pipeline-main-title">EeraFact Grounded Analysis Engine</h3>
          <p className="pipeline-status-text">
            {statusMessages[Math.min(currentStep, statusMessages.length - 1)]}
          </p>
        </div>
      </div>

      {/* Pipeline Progression Bar */}
      <div className="pipeline-progress-track">
        <div
          className="pipeline-progress-fill"
          style={{ width: `${((currentStep + 1) / pipelineSteps.length) * 100}%` }}
        />
      </div>

      {/* 7-Step Claymorphic Pipeline Nodes */}
      <div className="clay-pipeline-steps-list">
        {pipelineSteps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={idx}
              className={`clay-pipeline-node ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="pipeline-node-indicator">
                {isDone ? (
                  <CheckCircle2 size={18} className="node-icon-done" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="node-icon-active spin" />
                ) : (
                  <span className="node-dot-pending" />
                )}
              </div>

              <div className="pipeline-node-content">
                <div className="pipeline-node-label-row">
                  <span className="node-step-label">{step.label}</span>
                  {isCurrent && <span className="node-live-tag">In progress...</span>}
                  {isDone && <span className="node-done-tag">Verified</span>}
                </div>
                <p className="node-step-desc">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
