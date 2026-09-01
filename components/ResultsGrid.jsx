'use client';

import React from 'react';

export default function ResultsGrid() {
  return (
    <section className="results-section" id="results-section">
      <div className="container">
        
        {/* SiRY-Inspired Dashboard KPI Summary Cards Bar */}
        <div className="siry-kpi-grid">
          <div className="siry-kpi-card total" id="kpi-card-all">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Total des Métiers</span>
              <span className="siry-kpi-icon blue">📁</span>
            </div>
            <div className="siry-kpi-value" id="kpi-total-jobs">3 468</div>
            <span className="siry-kpi-sub">Catalogue RTMC &amp; ESCO unifié</span>
          </div>

          <div className="siry-kpi-card rtmc" id="kpi-card-rtmc">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Référentiel RTMC 🇹🇳</span>
              <span className="siry-kpi-icon green">✓</span>
            </div>
            <div className="siry-kpi-value" id="kpi-rtmc-jobs">530</div>
            <span className="siry-kpi-sub">Métiers nationaux tunisiens</span>
          </div>

          <div className="siry-kpi-card esco" id="kpi-card-esco">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Référentiel ESCO 🇪🇺</span>
              <span className="siry-kpi-icon orange">🌐</span>
            </div>
            <div className="siry-kpi-value" id="kpi-esco-jobs">2 938</div>
            <span className="siry-kpi-sub">Métiers standards européens</span>
          </div>

          <div className="siry-kpi-card skills" id="kpi-card-skills">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Compétences Indexées</span>
              <span className="siry-kpi-icon slate">⚡</span>
            </div>
            <div className="siry-kpi-value">12 400+</div>
            <span className="siry-kpi-sub">Savoirs, savoir-faire &amp; soft skills</span>
          </div>
        </div>

        {/* Section Head for Results */}
        <div className="results-header-bar">
          <div>
            <h2 className="results-main-title">Catalogue des Fiches Métiers</h2>
            <p className="results-sub-title">Explorez les référentiels, comparez les profils et découvrez les passerelles professionnelles.</p>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="jobs-grid" id="jobs-grid">
          {/* Les cartes métiers sont générées dynamiquement */}
        </div>

        {/* Load More */}
        <div className="load-more-row">
          <button className="btn-load-more" id="btn-load-more" data-i18n="load_more" style={{ display: 'none' }}>
            Charger plus de métiers
          </button>
        </div>
      </div>
    </section>
  );
}
