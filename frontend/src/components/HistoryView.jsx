import React, { useState, useEffect } from 'react';
import { Search, Trash2, Calendar, FileText, Link, Image as ImageIcon, Mic, ExternalLink, X, AlertCircle } from 'lucide-react';
import ReportCard from './ReportCard';

export default function HistoryView() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
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
        setError(data.error || 'Failed to load history.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan log?')) return;
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
      alert('Failed to delete scan.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear ALL scan history permanently?')) return;
    try {
      const res = await fetch('/api/history/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setScans([]);
        setSelectedScan(null);
      }
    } catch (err) {
      alert('Failed to clear history.');
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      (scan.input_content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.reasoning || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerdict =
      verdictFilter === 'ALL' || (scan.verdict || '').toUpperCase() === verdictFilter.toUpperCase();

    return matchesSearch && matchesVerdict;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'url':
        return <Link size={14} />;
      case 'image':
        return <ImageIcon size={14} />;
      case 'audio':
        return <Mic size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getVerdictBadgeClass = (v) => {
    switch (v) {
      case 'Real':
        return 'real';
      case 'Fake':
        return 'fake';
      case 'Misleading':
        return 'misleading';
      default:
        return 'unverifiable';
    }
  };

  return (
    <div>
      <div className="history-controls">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="custom-input"
            placeholder="Search past fact checks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {['ALL', 'REAL', 'FAKE', 'MISLEADING', 'UNVERIFIABLE'].map((v) => (
            <button
              key={v}
              className={`filter-pill ${verdictFilter === v ? 'active' : ''}`}
              onClick={() => setVerdictFilter(v)}
            >
              {v}
            </button>
          ))}
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Trash2 size={15} />
            Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading scan history...
        </div>
      ) : error ? (
        <div className="error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Scan Records Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {scans.length === 0 ? 'Perform your first fact check using the Detector tab above.' : 'No scans match your search query.'}
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="glass-panel history-card"
              onClick={() => setSelectedScan(scan)}
            >
              <div>
                <div className="history-card-header">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {getTypeIcon(scan.input_type)}
                    {scan.input_type}
                  </span>

                  <span
                    className={`verdict-badge ${getVerdictBadgeClass(scan.verdict)}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  >
                    {scan.verdict} ({scan.confidence_score}%)
                  </span>
                </div>

                <div className="history-card-content">
                  {scan.input_content}
                </div>
              </div>

              <div className="history-card-footer">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} />
                  {scan.timestamp}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, scan.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Delete Log"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sticky-header">
              <div className="modal-title-left">
                <h3 className="modal-heading">Fact Check Log Detail</h3>
                <span className="modal-log-badge">LOG #{selectedScan.id}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedScan(null)}
                title="Close Log Detail"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scroll">
              <ReportCard
                data={{
                  verdict: selectedScan.verdict,
                  confidence_score: selectedScan.confidence_score,
                  language_detected: selectedScan.language,
                  reasoning: selectedScan.reasoning,
                  manipulation_techniques: selectedScan.manipulation_techniques,
                  sources: selectedScan.sources,
                  claim_text: selectedScan.claim_text || selectedScan.input_content
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
