import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  BarChart3, 
  History, 
  Settings, 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('eerafact-theme') === 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { id: 'landing', label: 'Home', icon: <Compass size={17} /> },
    { id: 'verify', label: 'Verify', icon: <Search size={17} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={17} /> },
    { id: 'history', label: 'History', icon: <History size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="clay-navbar-wrapper">
      <div className="clay-navbar-container">
        {/* Brand Mark & Identity */}
        <div 
          className="clay-brand-group" 
          onClick={() => handleTabClick('landing')}
          role="button"
          tabIndex={0}
          title="EeraFact Home"
        >
          <div className="clay-brand-badge">
            <svg viewBox="0 0 32 32" className="clay-brand-svg">
              <circle cx="16" cy="16" r="14" fill="var(--color-primary)" />
              <circle cx="16" cy="16" r="8" fill="var(--color-surface)" />
              <path 
                d="M13 16.5 L15.5 19 L19.5 13.5" 
                stroke="var(--color-primary)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
              />
            </svg>
          </div>
          <div className="clay-brand-text">
            <span className="clay-brand-title">EeraFact</span>
            <span className="clay-brand-tagline">Think. Verify. Trust.</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="clay-nav-tabs" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`clay-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <span className="nav-btn-icon">{item.icon}</span>
              <span className="nav-btn-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Header Right Actions */}
        <div className="clay-nav-actions">
          {/* AI Engine Status Pill */}
          <div className="clay-status-pill" title="AI Verification & Search Grounding Engine is Online">
            <span className="clay-pulse-dot" />
            <span className="clay-status-label">AI Engine Active</span>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            className="clay-icon-btn"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? 'Switch to warm light mode' : 'Switch to dark editorial mode'}
            title={darkMode ? 'Switch to warm light mode' : 'Switch to dark editorial mode'}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="clay-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="clay-mobile-drawer">
          <div className="clay-mobile-nav-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`clay-mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="mobile-item-icon">{item.icon}</span>
                <span className="mobile-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
