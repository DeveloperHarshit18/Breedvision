import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ConfidenceBar from '../components/ConfidenceBar';
import './ResultPage.css';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // Guard: if user navigates directly without data, send home
  if (!state?.result) {
    return (
      <div className="result-page">
        <div className="result-empty container">
          <p>No prediction found.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 20 }}>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const { result, previewUrl } = state;
  const { breed, confidence } = result;

  return (
    <main className="result-page">
      <div className="result-wrapper">
        <div className="result-content">

          {/* ── Two-Column Layout ── */}
          <div className="result-grid">

            {/* ── LEFT: Image ── */}
            <div className="result-left">
              <div className="result-image-wrap card">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Uploaded — identified as ${breed}`}
                    className="result-image"
                  />
                ) : (
                  <div className="result-image-placeholder">
                    No image preview
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Identified Breed & Actions ── */}
            <div className="result-right">
              <div className="prediction-card card">
                <div className="prediction-header">
                  <span className="prediction-label">Identified Breed</span>
                  {/* <span className="prediction-tag">AI Prediction</span> */}
                </div>
                
                <h2 className="prediction-breed">{breed}</h2>
                
                <div className="confidence-section">
                  <label className="confidence-label">Confidence Score</label>
                  <ConfidenceBar value={confidence} />
                </div>

                <div className="prediction-meta">
                  <div className="meta-item">
                    <span className="meta-label">Confidence</span>
                    <span className="meta-value">{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className="meta-value status-badge">Verified</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="result-actions-right">
                <button className="btn-primary" onClick={() => navigate('/')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1v6h6M23 23v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Identify Another
                </button>
                <Link to="/history" className="btn-ghost">
                  View History
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
