'use client';

import React from 'react';

export default function ResultsGrid() {
  return (
    <section className="results-section" id="results-section">
      <div className="container">
        <div className="jobs-grid" id="jobs-grid">
          {/* Les cartes métiers sont générées dynamiquement */}
        </div>
        <div className="load-more-row">
          <button className="btn-load-more" id="btn-load-more" data-i18n="load_more" style={{ display: 'none' }}>
            Charger plus
          </button>
        </div>
      </div>
    </section>
  );
}
