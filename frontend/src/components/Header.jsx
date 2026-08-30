import React from 'react';
import { Target, History, Search } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const scrollToSection = (id) => {
    setActiveTab('scan');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand" onClick={() => setActiveTab('scan')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Target size={22} className="brand-target-icon" />
          </div>
          <div>
            <h1 className="brand-title">TruthLens</h1>
            <div className="brand-subtitle">AI MISINFORMATION DETECTOR</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs-center">
          <button
            className={`nav-link ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            Detector
          </button>
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className="nav-link"
            onClick={() => scrollToSection('how-it-works')}
          >
            About
          </button>
          <button
            className="nav-link"
            onClick={() => scrollToSection('how-it-works')}
          >
            How It Works
          </button>
        </nav>

        {/* AI Engine Status Badge */}
        <div className="ai-status-pill">
          <span className="status-dot-green" />
          <span>AI Engine Online</span>
        </div>
      </div>
    </header>
  );
}

