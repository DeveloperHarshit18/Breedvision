import React, { useEffect, useState } from 'react';
import './ConfidenceBar.css';

/**
 * ConfidenceBar
 * Animates from 0 → value on mount.
 * Props: value (0–1 float), e.g. 0.92
 */
export default function ConfidenceBar({ value }) {
  const [displayed, setDisplayed] = useState(0);
  const pct = Math.round(value * 100);

  // Animate bar fill after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDisplayed(pct));
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const level =
    pct >= 85 ? 'high' :
    pct >= 65 ? 'medium' : 'low';

  const label =
    pct >= 85 ? 'High confidence' :
    pct >= 65 ? 'Moderate confidence' : 'Low confidence';

  return (
    <div className="conf-bar-wrapper">
      <div className="conf-bar-header">
        <span className="conf-bar-label">{label}</span>
        <span className={`conf-bar-pct conf-bar-pct--${level}`}>{pct}%</span>
      </div>
      <div className="conf-bar-track">
        <div
          className={`conf-bar-fill conf-bar-fill--${level}`}
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
