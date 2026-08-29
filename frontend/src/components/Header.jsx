import React from 'react';
import { ShieldCheck, History, Search } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="brand-title">TruthLens</h1>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <Search size={16} />
            Detector
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            History
          </button>
        </nav>
      </div>
    </header>
  );
}
