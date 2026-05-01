import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Analyzing breed…' }) {
  return (
    <div className="spinner-overlay" role="status" aria-live="polite">
      <div className="spinner-box">
        <div className="spinner-ring">
          <div className="spinner-ring-inner" />
        </div>
        <div className="spinner-dots">
          <span />
          <span />
          <span />
        </div>
        <p className="spinner-message">{message}</p>
        <p className="spinner-sub">Our AI is examining the image</p>
      </div>
    </div>
  );
}
