import React from 'react';
import './BreedCard.css';

/**
 * BreedCard
 * Displays breed detail pills returned from the API.
 * Props: details { origin, milk, features, purpose, weight_kg }
 */
export default function BreedCard({ details }) {
  if (!details) return null;

  const stats = [
    { icon: '📍', label: 'Origin',          value: details.origin },
    { icon: '🥛', label: 'Milk Production', value: details.milk },
    { icon: '🎯', label: 'Purpose',         value: details.purpose },
    { icon: '⚖️', label: 'Weight',          value: details.weight_kg },
  ].filter(s => s.value && s.value !== 'N/A');

  return (
    <div className="breed-card">
      {/* Stats grid */}
      {stats.length > 0 && (
        <div className="breed-stats-grid">
          {stats.map((stat) => (
            <div className="breed-stat" key={stat.label}>
              <span className="breed-stat-icon">{stat.icon}</span>
              <div className="breed-stat-text">
                <span className="breed-stat-label">{stat.label}</span>
                <span className="breed-stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features paragraph */}
      {details.features && details.features !== 'N/A' && (
        <div className="breed-features">
          <p className="breed-features-label">Characteristics</p>
          <p className="breed-features-text">{details.features}</p>
        </div>
      )}
    </div>
  );
}
