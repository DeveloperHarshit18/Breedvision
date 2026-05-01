import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistory, deleteHistoryEntry, clearHistory } from '../services/api';
import './HistoryPage.css';

export default function HistoryPage({ showHelpModal, setShowHelpModal }) {
  const [history, setHistory]   = useState([]);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();
  const LIMIT = 9;

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchHistory(p, LIMIT);
      setHistory(data.items);
      setPage(data.page);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      setError('Could not load history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteHistoryEntry(id);
      load(page);
    } catch {
      alert('Failed to delete entry.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`Clear all ${total} history entries? This cannot be undone.`)) return;
    try {
      await clearHistory();
      setHistory([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
    } catch {
      alert('Failed to clear history.');
    }
  };

  const confidenceColor = (c) =>
    c >= 0.85 ? 'var(--accent-green-light)' :
    c >= 0.65 ? 'var(--accent-gold)' : '#e07070';

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <main className="history-page">
      {/* ── Help Modal ── */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowHelpModal(false)}
              aria-label="Close help"
            >
              ✕
            </button>
            
            <h2 className="modal-title">How It Works</h2>
            
            <div className="help-steps">
              {[
                { n: '01', title: 'Capture',  desc: 'Upload a photo or use the live camera to snap a picture of the animal.' },
                { n: '02', title: 'Analyse',  desc: 'Our model examines coat, body shape, and horn profile.' },
                { n: '03', title: 'Discover', desc: 'Get breed name, confidence, and full production stats.' },
              ].map(step => (
                <div className="help-step" key={step.n}>
                  <span className="help-step-num">{step.n}</span>
                  <div className="help-step-content">
                    <h4 className="help-step-title">{step.title}</h4>
                    <p className="help-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="history-container container">

        {/* ── Header ── */}
        <div className="history-header fade-up">
          <div>
            <h1 className="history-title">Prediction History</h1>
            <p className="history-sub">
              {total} identification{total !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="history-actions">
            <button className="btn-ghost" onClick={() => navigate('/')}>
              + New Scan
            </button>
            {total > 0 && (
              <button className="btn-ghost btn-danger" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="history-loading">
            {[...Array(6)].map((_, i) => (
              <div className="skeleton-card" key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="history-error" role="alert">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <div className="history-empty-icon">🐄</div>
            <h3>No predictions yet</h3>
            <p>Upload your first cattle image to get started</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Identify a Breed
            </button>
          </div>
        )}

        {/* ── History grid ── */}
        {!loading && history.length > 0 && (
          <>
            <div className="history-grid fade-up-2">
              {history.map((item) => (
                <div className="history-card card" key={item.id}>
                  {/* Top: breed name + delete */}
                  <div className="hcard-header">
                    <div>
                      <span className="hcard-breed">{item.breed}</span>
                      <span className="hcard-origin">
                        {item.details?.origin || ''}
                      </span>
                    </div>
                    <button
                      className="hcard-delete"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete entry"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Confidence pill */}
                  <div className="hcard-confidence">
                    <span
                      className="hcard-conf-dot"
                      style={{ background: confidenceColor(item.confidence) }}
                    />
                    <span
                      className="hcard-conf-val"
                      style={{ color: confidenceColor(item.confidence) }}
                    >
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="hcard-details">
                    {item.details?.milk && (
                      <span className="hcard-pill">🥛 {item.details.milk}</span>
                    )}
                    {item.details?.purpose && (
                      <span className="hcard-pill">🎯 {item.details.purpose}</span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <time className="hcard-time">
                    {item.timestamp ? formatDate(item.timestamp) : 'Unknown date'}
                  </time>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-ghost"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn-ghost"
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
