import React from 'react';
import {
  ShieldCheck,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  CheckCircle2,
  Search,
  Cpu,
  Layers,
  Sparkles,
  Globe2,
  Flame,
  Share2
} from 'lucide-react';

export default function LandingView({ onStartVerify, onSelectInputType }) {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('landing-how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const processSteps = [
    {
      num: '01',
      title: 'Input',
      desc: 'Text, news URL, image screenshot, or WhatsApp voice note.',
      icon: <Layers size={20} />
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'Vernacular NLP parsing, image ELA forensics & audio transcription.',
      icon: <Cpu size={20} />
    },
    {
      num: '03',
      title: 'Verify',
      desc: 'Real-time search grounding and multi-source corroboration.',
      icon: <Search size={20} />
    },
    {
      num: '04',
      title: 'Evidence',
      desc: 'Factual contradictions, source snippets & manipulation flags.',
      icon: <FileText size={20} />
    },
    {
      num: '05',
      title: 'Verdict',
      desc: 'Clear Real / Fake / Misleading verdict with 0–100% confidence.',
      icon: <ShieldCheck size={20} />
    }
  ];

  const modalities = [
    {
      type: 'text',
      title: 'Text & Viral Claims',
      tagline: 'WhatsApp & Social Rumors',
      desc: 'Verify forwarded claims, sensational captions, and multilingual statements in English, Hindi, and Hinglish.',
      icon: <FileText size={22} />,
      sample: '“PM Modi announces free 5G recharge scheme…”'
    },
    {
      type: 'url',
      title: 'News Article URLs',
      tagline: 'Domain & Source Audit',
      desc: 'Check breaking news links, detect cloned or imposter portals, and cross-reference stories against trusted newsrooms.',
      icon: <LinkIcon size={22} />,
      sample: 'https://news-portal.example.com/article/1042'
    },
    {
      type: 'image',
      title: 'Image Forensics',
      tagline: 'ELA Tampering Heatmaps',
      desc: 'Detect Photoshop edits, doctored documents, text splice modifications, and deepfake artifacts via Error Level Analysis.',
      icon: <ImageIcon size={22} />,
      sample: 'Manipulated government notices & viral memes'
    },
    {
      type: 'audio',
      title: 'Voice Notes & Audio',
      tagline: 'Speech-to-Fact Audit',
      desc: 'Upload viral audio clips or record live voice notes to transcribe and fact-check rumors circulating in chat groups.',
      icon: <Mic size={22} />,
      sample: 'Forwarded voice messages & speeches'
    }
  ];

  const trustHighlights = [
    { value: '15,200+', label: 'Claims Analyzed', desc: 'Across English, Hindi & regional dialects' },
    { value: '98.7%', label: 'Grounded Accuracy', desc: 'Backed by live search cross-examination' },
    { value: '250K+', label: 'Verified Sources', desc: 'Fact-checking repositories & trusted journals' },
    { value: '< 2.5s', label: 'Analysis Speed', desc: 'Instant multi-signal inference' }
  ];

  return (
    <div className="clay-landing-page">
      {/* 1. HERO SECTION */}
      <section className="clay-hero-section">
        <div className="clay-hero-badge">
          <Sparkles size={15} />
          <span>EVALUATE CLAIMS BEFORE YOU SHARE</span>
        </div>

        <h1 className="clay-hero-title">
          Think. Verify. <span className="clay-hero-highlight">Trust.</span>
        </h1>

        <p className="clay-hero-subtitle">
          AI-powered multimodal fact-checking for the information you see, hear and share.
          Investigate claims, cross-examine web evidence, and detect doctored media with confidence.
        </p>

        {/* Hero CTAs */}
        <div className="clay-hero-cta-group">
          <button
            type="button"
            className="clay-btn clay-btn-primary clay-btn-lg"
            onClick={onStartVerify}
          >
            <span>Verify Content</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="clay-btn clay-btn-secondary clay-btn-lg"
            onClick={scrollToHowItWorks}
          >
            <span>Explore How It Works</span>
          </button>
        </div>

        {/* Hero Trust Badges */}
        <div className="clay-hero-features-ribbon">
          <div className="ribbon-item">
            <CheckCircle2 size={16} className="ribbon-icon" />
            <span>Multimodal: Text, URL, Image & Audio</span>
          </div>
          <div className="ribbon-divider">•</div>
          <div className="ribbon-item">
            <CheckCircle2 size={16} className="ribbon-icon" />
            <span>Error Level Analysis (ELA) Forensics</span>
          </div>
          <div className="ribbon-divider">•</div>
          <div className="ribbon-item">
            <CheckCircle2 size={16} className="ribbon-icon" />
            <span>Search Grounding & Vernacular NLP</span>
          </div>
        </div>

        {/* Visual Clay Verification Process Illustration */}
        <div className="clay-process-preview-card">
          <div className="process-preview-header">
            <span className="process-pill">VERIFICATION PIPELINE</span>
            <h3 className="process-heading">From Viral Claim to Verified Evidence</h3>
          </div>

          <div className="clay-process-flow">
            {processSteps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="clay-process-step-node">
                  <div className="step-node-badge">{step.num}</div>
                  <div className="step-node-icon">{step.icon}</div>
                  <h4 className="step-node-title">{step.title}</h4>
                  <p className="step-node-desc">{step.desc}</p>
                </div>
                {idx < processSteps.length - 1 && (
                  <div className="clay-process-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ONE PLATFORM, MULTIPLE WAYS TO VERIFY */}
      <section className="clay-section">
        <div className="clay-section-header">
          <span className="clay-section-kicker">MULTIMODAL INTELLIGENCE</span>
          <h2 className="clay-section-title">One Platform. Multiple Ways to Verify.</h2>
          <p className="clay-section-sub">
            Misinformation spreads in formats beyond plain text. EeraFact provides purpose-built verification for every media channel.
          </p>
        </div>

        <div className="clay-modalities-grid">
          {modalities.map((item) => (
            <div
              key={item.type}
              className="clay-card clay-modality-card"
              onClick={() => onSelectInputType(item.type)}
              role="button"
              tabIndex={0}
              title={`Click to start verifying ${item.title}`}
            >
              <div className="modality-card-top">
                <div className="modality-icon-box">
                  {item.icon}
                </div>
                <span className="modality-tag">{item.tagline}</span>
              </div>

              <h3 className="modality-title">{item.title}</h3>
              <p className="modality-desc">{item.desc}</p>

              <div className="modality-sample-box">
                <span className="sample-kicker">Example:</span>
                <span className="sample-text">{item.sample}</span>
              </div>

              <div className="modality-card-footer">
                <span className="action-link-text">Try this format</span>
                <ArrowRight size={16} className="action-arrow" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS (IN-DEPTH) */}
      <section id="landing-how-it-works" className="clay-section">
        <div className="clay-section-header">
          <span className="clay-section-kicker">THE VERIFICATION ENGINE</span>
          <h2 className="clay-section-title">How EeraFact Evaluates Credibility</h2>
          <p className="clay-section-sub">
            A transparent, multi-layered pipeline ensuring grounded fact-checking without opaque conclusions.
          </p>
        </div>

        <div className="clay-engine-grid">
          <div className="clay-card clay-engine-feature">
            <div className="engine-num">01</div>
            <div className="engine-icon-wrap">
              <Globe2 size={24} />
            </div>
            <h3 className="engine-title">Real-Time Web & News Retrieval</h3>
            <p className="engine-desc">
              Every query triggers live search grounding against verified news outlets, official government portals, press bureaus, and authoritative public databases.
            </p>
          </div>

          <div className="clay-card clay-engine-feature">
            <div className="engine-num">02</div>
            <div className="engine-icon-wrap">
              <Flame size={24} />
            </div>
            <h3 className="engine-title">ELA Image Forensic Heatmaps</h3>
            <p className="engine-desc">
              Error Level Analysis evaluates compression ratios across pixel matrices to reveal spliced captions, forged signatures, or spliced stamps before they fool the public.
            </p>
          </div>

          <div className="clay-card clay-engine-feature">
            <div className="engine-num">03</div>
            <div className="engine-icon-wrap">
              <Cpu size={24} />
            </div>
            <h3 className="engine-title">Grounded AI Reasoning</h3>
            <p className="engine-desc">
              Advanced AI synthesizes linguistic semantics, detects sensationalism and emotional manipulation triggers, and produces a nuanced, evidence-backed verdict.
            </p>
          </div>

          <div className="clay-card clay-engine-feature">
            <div className="engine-num">04</div>
            <div className="engine-icon-wrap">
              <Share2 size={24} />
            </div>
            <h3 className="engine-title">Shareable WhatsApp Posters</h3>
            <p className="engine-desc">
              Generate 1-click graphic bulletins to counter viral fake news directly in WhatsApp family groups and community channels where rumors circulate.
            </p>
          </div>
        </div>
      </section>

      {/* 4. IMPACT STATS */}
      <section className="clay-section">
        <div className="clay-card clay-stats-banner">
          <div className="stats-banner-intro">
            <span className="stats-kicker">PROVEN RESILIENCE</span>
            <h3 className="stats-heading">Built for Students, Researchers, Journalists & Citizens</h3>
            <p className="stats-sub">
              Empowering communities with transparent media literacy and fact verification tools.
            </p>
          </div>

          <div className="stats-grid">
            {trustHighlights.map((stat, i) => (
              <div key={i} className="stat-pill-card">
                <div className="stat-val">{stat.value}</div>
                <div className="stat-lbl">{stat.label}</div>
                <div className="stat-sub">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="clay-section" style={{ marginBottom: '2rem' }}>
        <div className="clay-card clay-cta-card">
          <div className="cta-content">
            <span className="cta-kicker">GET STARTED NOW</span>
            <h2 className="cta-title">Don’t blindly trust. Verify before you share.</h2>
            <p className="cta-description">
              Paste a suspicious message, link, screenshot, or audio note now and get a comprehensive verification report in seconds.
            </p>
            <button
              type="button"
              className="clay-btn clay-btn-primary clay-btn-lg"
              onClick={onStartVerify}
            >
              <span>Launch Verification Detector</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
