import React from 'react';
import {
  Target,
  ShieldCheck,
  Search,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  Cpu,
  Database,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Zap,
  Layers,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AboutView({ onStartScan }) {
  const features = [
    {
      icon: <FileText size={24} className="feature-icon cyan" />,
      title: "Text & Claim Verification",
      subtitle: "Multi-language Text Analysis",
      description: "Verifies rumors, social media claims, WhatsApp forwards, quotes, and statements using language semantics and pattern detection."
    },
    {
      icon: <LinkIcon size={24} className="feature-icon blue" />,
      title: "News URL Fact-Checking",
      subtitle: "Real-Time Web Grounding",
      description: "Extracts news article links, audits domain credibility, and cross-references claims against trusted global news sources."
    },
    {
      icon: <ImageIcon size={24} className="feature-icon rose" />,
      title: "Image Forensics & ELA",
      subtitle: "Error Level Analysis & Heatmaps",
      description: "Performs digital image forensics using ELA to expose image manipulation, photo editing, text overlays, and AI-generated alterations."
    },
    {
      icon: <Mic size={24} className="feature-icon purple" />,
      title: "Audio Voice Note Audit",
      subtitle: "Speech-to-Fact Verification",
      description: "Transcribes and analyzes audio recordings or voice notes to extract spoken statements and test them against factual databases."
    },
    {
      icon: <Cpu size={24} className="feature-icon cyan" />,
      title: "AI Grounding Engine",
      subtitle: "Google Search Integration",
      description: "Leverages AI combined with live search grounding to perform contextual reasoning and verify current events."
    },
    {
      icon: <Target size={24} className="feature-icon green" />,
      title: "4-Tier Verdict Classification",
      subtitle: "Confidence & Accuracy Score",
      description: "Classifies claims into Real, Fake, Misleading, or Unverifiable verdicts complete with a 0–100% AI confidence index."
    },
    {
      icon: <AlertTriangle size={24} className="feature-icon yellow" />,
      title: "Manipulation Tactics Detection",
      subtitle: "Rhetorical Signal Detection",
      description: "Flags deceptive strategies such as Out-of-Context Media, Emotionally Charged Language, Selective Context, and Deepfakes."
    },
    {
      icon: <Database size={24} className="feature-icon blue" />,
      title: "SQLite History & Persistence",
      subtitle: "Search, Filter & Export",
      description: "Stores scan results locally in SQLite. Offers keyword search, verdict filtering, detailed report modals, and item deletion controls."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Multi-Modal Input",
      desc: "User submits Text claim, Article URL, Image screenshot, or Audio recording.",
      icon: <Layers size={20} />
    },
    {
      step: "02",
      title: "Forensic & Semantic Parsing",
      desc: "System performs Image ELA analysis or Audio transcription alongside language parsing.",
      icon: <Eye size={20} />
    },
    {
      step: "03",
      title: "AI & Web Search Grounding",
      desc: "AI cross-examines claim against live internet search index and trusted publishers.",
      icon: <Cpu size={20} />
    },
    {
      step: "04",
      title: "Verdict Report & SQLite Log",
      desc: "Generates interactive report with sources, manipulation tactics, and saves to database.",
      icon: <CheckCircle2 size={20} />
    }
  ];

  const techStack = [
    { name: "React 19", role: "Frontend UI Framework", color: "#38bdf8" },
    { name: "Python Flask", role: "Backend REST API", color: "#60a5fa" },
    { name: "Advanced AI Engine", role: "LLM & Search Grounding", color: "#c084fc" },
    { name: "OpenCV & PIL", role: "Image ELA Forensics", color: "#f43f5e" },
    { name: "SQLite 3", role: "Persistent Database", color: "#34d399" },
    { name: "Lucide Icons", role: "Design System", color: "#fbbf24" }
  ];

  return (
    <div className="about-page-wrapper">
      {/* HERO SECTION */}
      <div className="about-hero glass-panel">
        <div className="about-hero-badge">
          <Sparkles size={16} />
          <span>PROJECT OVERVIEW & CORE FUNCTIONS</span>
        </div>

        <h1 className="about-hero-title">
          EeraFact AI <span className="hero-gradient-text-pink">Intelligence System</span>
        </h1>

        <p className="about-hero-description">
          EeraFact is an end-to-end, multi-modal misinformation detection system designed to fight fake news,
          doctored media, manipulated quotes, and unverified viral rumors across digital channels.
        </p>

        <div className="about-stats-row">
          <div className="about-stat-box">
            <span className="stat-value">4+</span>
            <span className="stat-label">Input Formats (Text, URL, Image, Audio)</span>
          </div>
          <div className="about-stat-box">
            <span className="stat-value">Real-time</span>
            <span className="stat-label">Live Web Grounding</span>
          </div>
          <div className="about-stat-box">
            <span className="stat-value">ELA Forensics</span>
            <span className="stat-label">Digital Image Tampering Detection</span>
          </div>
        </div>
      </div>

      {/* CORE FUNCTIONS GRID */}
      <div className="about-section-header">
        <div className="section-divider-title">
          <span className="dot" />
          <span className="divider-line" />
          <h2 className="how-works-heading">KEY SYSTEM FUNCTIONS & CAPABILITIES</h2>
          <span className="divider-line" />
          <span className="dot" />
        </div>
        <p className="section-subtext">
          Explore all the intelligent modules built into EeraFact to verify claims and analyze signals.
        </p>
      </div>

      <div className="features-grid">
        {features.map((item, idx) => (
          <div key={idx} className="glass-panel feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-wrapper">
                {item.icon}
              </div>
              <div>
                <h3 className="feature-title">{item.title}</h3>
                <span className="feature-subtitle">{item.subtitle}</span>
              </div>
            </div>
            <p className="feature-description">{item.description}</p>
          </div>
        ))}
      </div>

      {/* SYSTEM ARCHITECTURE & WORKFLOW */}
      <div className="about-section-header" style={{ marginTop: '4.5rem' }}>
        <div className="section-divider-title">
          <span className="dot" />
          <span className="divider-line" />
          <h2 className="how-works-heading">SYSTEM ARCHITECTURE & ANALYSIS WORKFLOW</h2>
          <span className="divider-line" />
          <span className="dot" />
        </div>
        <p className="section-subtext">
          How data flows from initial user submission to final fact-check verdict.
        </p>
      </div>

      <div className="workflow-timeline">
        {workflowSteps.map((step, idx) => (
          <div key={idx} className="glass-panel workflow-card">
            <div className="workflow-step-badge">{step.step}</div>
            <div className="workflow-icon-box">{step.icon}</div>
            <h4 className="workflow-title">{step.title}</h4>
            <p className="workflow-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* TECH STACK & ENGINE POWER */}
      <div className="glass-panel tech-stack-card">
        <div className="tech-stack-header">
          <Cpu size={28} className="tech-header-icon" />
          <div>
            <h3 className="tech-stack-title">TECHNOLOGY & ENGINE ARCHITECTURE</h3>
            <p className="tech-stack-subtitle">Built with modern AI frameworks, web grounding APIs, and forensic image algorithms</p>
          </div>
        </div>

        <div className="tech-pills-grid">
          {techStack.map((tech, idx) => (
            <div key={idx} className="tech-pill-box">
              <span className="tech-dot" style={{ background: tech.color }} />
              <div>
                <div className="tech-name">{tech.name}</div>
                <div className="tech-role">{tech.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CALL TO ACTION BUTTON */}
      <div className="about-cta-container">
        <div className="glass-panel about-cta-card">
          <h3 className="cta-title">Ready to verify news or claims?</h3>
          <p className="cta-desc">Test any text, URL, screenshot or voice note with EeraFact AI Detector.</p>
          <button type="button" className="submit-btn cta-btn" onClick={onStartScan}>
            <span>Launch Detector Engine</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
