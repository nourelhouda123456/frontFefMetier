'use client';

import React from 'react';

export default function ResultsGrid() {
  return (
    <section className="results-section" id="results-section">
      <div className="container">
        
        {/* Dashboard KPI Summary Cards Bar */}
        <div className="siry-kpi-grid">
          <div className="siry-kpi-card total" id="kpi-card-all">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Total des Métiers</span>
              <span className="siry-kpi-icon blue">📁</span>
            </div>
            <div className="siry-kpi-value" id="kpi-total-jobs">3 468</div>
            <span className="siry-kpi-sub">Catalogue officiel unifié</span>
          </div>

          <div className="siry-kpi-card rtmc" id="kpi-card-domaines">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Domaines Professionnels</span>
              <span className="siry-kpi-icon green">📂</span>
            </div>
            <div className="siry-kpi-value" id="kpi-domaines">85+</div>
            <span className="siry-kpi-sub">Secteurs d'activité couverts</span>
          </div>

          <div className="siry-kpi-card esco" id="kpi-card-passerelles">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Passerelles Mobilité</span>
              <span className="siry-kpi-icon orange">🔄</span>
            </div>
            <div className="siry-kpi-value" id="kpi-passerelles">4 500+</div>
            <span className="siry-kpi-sub">Correspondances de carrière</span>
          </div>

          <div className="siry-kpi-card skills" id="kpi-card-skills">
            <div className="siry-kpi-header">
              <span className="siry-kpi-title">Compétences Indexées</span>
              <span className="siry-kpi-icon slate">⚡</span>
            </div>
            <div className="siry-kpi-value">14 200+</div>
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
