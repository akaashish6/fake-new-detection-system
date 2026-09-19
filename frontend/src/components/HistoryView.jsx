import React, { useState, useEffect } from 'react';
import {
  Search,
  Trash2,
  Calendar,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  X,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import ReportCard from './ReportCard';

export default function HistoryView({ onNavigateVerify }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) {
        setScans(data.scans || []);
      } else {
        setError(data.error || 'Failed to retrieve scan history.');
      }
    } catch (err) {
      setError('Could not connect to the verification database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this verification record from SQLite history?')) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setScans((prev) => prev.filter((s) => s.id !== id));
        if (selectedScan && selectedScan.id === id) {
          setSelectedScan(null);
        }
      }
    } catch (err) {
      alert('Failed to delete scan record.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently clear ALL scan records from the database?')) return;
    try {
      const res = await fetch('/api/history/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setScans([]);
        setSelectedScan(null);
      }
    } catch (err) {
      alert('Failed to clear history database.');
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      (scan.input_content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.reasoning || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.claim_text || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerdict =
      verdictFilter === 'ALL' || (scan.verdict || '').toUpperCase() === verdictFilter.toUpperCase();

    const matchesType =
      typeFilter === 'ALL' || (scan.input_type || '').toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesVerdict && matchesType;
  });

  const getTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'url':
        return <LinkIcon size={14} />;
      case 'image':
        return <ImageIcon size={14} />;
      case 'audio':
        return <Mic size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getVerdictClass = (v) => {
    switch ((v || '').toLowerCase()) {
      case 'real':
        return 'tag-real';
      case 'fake':
        return 'tag-fake';
      case 'misleading':
        return 'tag-misleading';
      default:
        return 'tag-unverifiable';
    }
  };

  return (
    <div className="clay-history-view">
      {/* Header & Controls */}
      <div className="history-header-block">
        <div>
          <span className="clay-section-kicker">VERIFICATION ARCHIVE</span>
          <h2 className="history-main-title">Searchable Scan History</h2>
          <p className="history-sub">
            Review past claims, inspect full forensic reports, or export verified findings.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="clay-btn clay-btn-danger clay-btn-sm"
          >
            <Trash2 size={14} />
            <span>Clear All Records</span>
          </button>
        )}
      </div>

      {/* Clay Search & Filter Bar */}
      <div className="clay-card clay-filter-bar-card">
        <div className="filter-bar-top">
          <div className="clay-search-box">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="clay-search-input"
              placeholder="Search claims, keywords, or reasoning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="modality-filter-pills">
            {['ALL', 'TEXT', 'URL', 'IMAGE', 'AUDIO'].map((t) => (
              <button
                key={t}
                type="button"
                className={`clay-filter-pill ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="verdict-filter-pills-row">
          <span className="filter-label">Verdict:</span>
          {['ALL', 'REAL', 'FAKE', 'MISLEADING', 'UNVERIFIABLE'].map((v) => (
            <button
              key={v}
              type="button"
              className={`clay-verdict-filter-pill ${verdictFilter === v ? 'active' : ''}`}
              onClick={() => setVerdictFilter(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="clay-loading-state">
          <div className="loading-spinner-circle" />
          <p>Loading verification records from SQLite database...</p>
        </div>
      ) : error ? (
        <div className="clay-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="clay-card clay-empty-state-card">
          <div className="empty-avatar-icon">
            <FileText size={38} />
          </div>
          <h3 className="empty-title">
            {scans.length === 0 ? 'No Verification History Yet' : 'No Matching Claims Found'}
          </h3>
          <p className="empty-desc">
            {scans.length === 0
              ? 'Upload something suspicious and we’ll help you investigate and cross-check it.'
              : 'Try searching with different keywords or resetting your verdict filter.'}
          </p>
          {scans.length === 0 && onNavigateVerify && (
            <button
              type="button"
              className="clay-btn clay-btn-primary clay-btn-md"
              onClick={onNavigateVerify}
            >
              <span>Verify Your First Claim</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="clay-history-cards-grid">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="clay-card clay-history-item-card"
              onClick={() => setSelectedScan(scan)}
              role="button"
              tabIndex={0}
              title="Click to view full fact-check report"
            >
              <div className="history-item-top">
                <div className="item-type-pill">
                  {getTypeIcon(scan.input_type)}
                  <span>{scan.input_type}</span>
                </div>

                <div className="item-verdict-group">
                  <span className={`item-verdict-badge ${getVerdictClass(scan.verdict)}`}>
                    {scan.verdict}
                  </span>
                  <span className="item-score-pill">{scan.confidence_score}%</span>
                </div>
              </div>

              <div className="history-item-body">
                <p className="item-claim-text">
                  "{scan.input_content || scan.claim_text || 'Claim snippet'}"
                </p>
                {scan.reasoning && (
                  <p className="item-reasoning-preview">
                    {scan.reasoning.length > 120
                      ? `${scan.reasoning.slice(0, 120)}...`
                      : scan.reasoning}
                  </p>
                )}
              </div>

              <div className="history-item-footer">
                <div className="item-time">
                  <Calendar size={13} />
                  <span>{scan.timestamp || 'Recorded'}</span>
                </div>

                <div className="item-actions">
                  <button
                    type="button"
                    className="clay-delete-icon-btn"
                    onClick={(e) => handleDelete(e, scan.id)}
                    title="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Verification Report Modal */}
      {selectedScan && (
        <div className="clay-modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="clay-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="clay-modal-header">
              <div className="modal-title-left">
                <span className="modal-kicker">VERIFICATION REPORT ARCHIVE</span>
                <h3 className="modal-title">Report #{selectedScan.id}</h3>
              </div>
              <button
                type="button"
                className="clay-modal-close-btn"
                onClick={() => setSelectedScan(null)}
                title="Close report modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="clay-modal-body">
              <ReportCard
                data={{
                  scan_id: selectedScan.id,
                  verdict: selectedScan.verdict,
                  confidence_score: selectedScan.confidence_score,
                  language_detected: selectedScan.language,
                  reasoning: selectedScan.reasoning,
                  manipulation_techniques: selectedScan.manipulation_techniques,
                  sources: selectedScan.sources,
                  claim_text: selectedScan.claim_text || selectedScan.input_content,
                  timestamp: selectedScan.timestamp
                }}
                onReset={() => setSelectedScan(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
