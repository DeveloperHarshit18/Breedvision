import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictBreed } from '../services/api';
import './HomePage.css';

export default function HomePage({ showHelpModal, setShowHelpModal }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  // Called by UploadZone when user selects a file
  const handleFileSelected = useCallback((selectedFile) => {
    setError('');
    setFile(selectedFile);
    // Create a local object URL for instant preview
    if (preview) URL.revokeObjectURL(preview); // clean up previous
    setPreview(URL.createObjectURL(selectedFile));
  }, [preview]);

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image before submitting.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await predictBreed(file);
      // Pass result + preview URL to the result page via router state
      navigate('/result', {
        state: { result, previewUrl: preview },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        'Something went wrong. Is the backend running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-page">
      {loading && <LoadingSpinner message="Identifying breed…" />}

      {/* ── Main Two-Column Layout ── */}
      <section className="main-content">
        {/* LEFT: Upload Column */}
        <div className="upload-column">
          <div className="column-header">
            <h2 className="column-title">Upload Image</h2>
            <p className="column-subtitle">
              Supports Gir, Sahiwal, Murrah, Halikar &amp; more
            </p>
          </div>

          <div className="upload-card card">
            <UploadZone onFileSelected={handleFileSelected} preview={preview} />

            {file && (
              <div className="file-meta">
                <span className="file-meta-icon">📎</span>
                <span className="file-meta-name">{file.name}</span>
                <span className="file-meta-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  className="file-meta-clear"
                  onClick={() => { setFile(null); setPreview(null); setError(''); }}
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="submit-error" role="alert">
                ⚠ {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results/Action Column */}
        <div className="results-column">
          <div className="column-header">
            <h2 className="column-title">Identify Breed</h2>
            {/* <p className="column-subtitle">Get instant AI insights</p> */}
          </div>

          <div className="results-card card">
            <button
              className="btn-primary identify-btn"
              onClick={handleSubmit}
              disabled={!file || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Start Identification
            </button>
            
            <div className="results-placeholder">
              <p>Upload an image and click "Start Identification" to see results</p>
            </div>
          </div>
        </div>
      </section>

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
    </main>
  );
}
