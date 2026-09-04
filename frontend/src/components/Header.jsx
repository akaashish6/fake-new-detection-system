import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('eerafact-theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-mode');
      localStorage.setItem('eerafact-theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      localStorage.setItem('eerafact-theme', 'light');
    }
  }, [darkMode]);

  const scrollToSection = (id) => {
    setActiveTab('scan');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="app-header">
      <div className="header-container">

        {/* Brand */}
        <div
          className="brand"
          onClick={() => setActiveTab('scan')}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/assets/eerafact_logo.svg"
            alt="EeraFact Logo"
            className="brand-logo"
          />
          <h1 className="brand-title">EeraFact</h1>
        </div>

        {/* Navigation */}
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
            className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
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

        {/* Right: AI Status + Dark Mode Toggle */}
        <div className="header-right-group">
          <div className="ai-status-pill">
            <span className="status-dot-green" />
            <span>AI Engine Online</span>
          </div>

          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

      </div>
    </header>
  );
}
