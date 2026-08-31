'use client';

import React from 'react';

export default function CareerSalarySection() {
  return (
    <section className="career-salary-section" id="career-salary-section">
      <div className="career-salary-container">
        {/* Section Header */}
        <div className="career-salary-header">
          <div className="career-salary-badge">
            <span className="pulse-live-dot"></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            OBSERVATOIRE DES NIVEAUX ET RÉMUNÉRATIONS
          </div>
          <h2 className="career-salary-title">Grille des Niveaux et Rémunérations Prévisionnelles</h2>
          <p className="career-salary-desc">
            Consultez les estimations salariales, les paliers de qualification et les compétences attendues par niveau d'expérience selon les référentiels officiels RTMC (Tunisie) et ESCO (Europe).
          </p>
          
          {/* Quick Info Pills */}
          <div className="career-stat-pills">
            <span className="career-stat-pill"><span className="pill-tier">Niveau 1</span> Débutant (0-1 an)</span>
            <span className="career-stat-pill"><span className="pill-tier">Niveau 2</span> Junior (1-3 ans)</span>
            <span className="career-stat-pill"><span className="pill-tier">Niveau 3</span> Confirmé (3-5 ans)</span>
            <span className="career-stat-pill"><span className="pill-tier">Niveau 4</span> Senior (5-8 ans)</span>
            <span className="career-stat-pill"><span className="pill-tier">Niveau 5</span> Expert / Lead (8+ ans)</span>
          </div>
        </div>

        {/* Interactive Simulator Box */}
        <div className="career-sim-box">
          {/* Row 1: Job Selection */}
          <div className="career-sim-field-group">
            <label htmlFor="career-salary-input">
              <span className="career-field-step">1</span> Sélection du métier de référence (RTMC / ESCO)
            </label>
            <div className="career-input-wrap">
              <input type="text" id="career-salary-input" placeholder="Rechercher par intitulé ou code métier (ex : Développeur web, Infirmier, Comptable, A1101...)" autoComplete="off" />
              <div className="career-sugg-box" id="career-salary-sugg"></div>
            </div>
          </div>

          {/* Row 2: Seniority Level Selector */}
          <div className="career-sim-field-group" style={{ marginTop: '22px' }}>
            <label>
              <span className="career-field-step">2</span> Définition du niveau de qualification et d'expérience
            </label>
            <div className="career-level-selector" id="career-level-selector">
              <button type="button" className="career-level-btn" data-level="debutant">
                <span className="level-btn-badge">N1</span>
                <div className="level-btn-text">
                  <span className="level-btn-name">Débutant</span>
                  <span className="level-btn-exp">0 – 1 an</span>
                </div>
              </button>

              <button type="button" className="career-level-btn active" data-level="junior">
                <span className="level-btn-badge">N2</span>
                <div className="level-btn-text">
                  <span className="level-btn-name">Junior</span>
                  <span className="level-btn-exp">1 – 3 ans</span>
                </div>
              </button>

              <button type="button" className="career-level-btn" data-level="confirme">
                <span className="level-btn-badge">N3</span>
                <div className="level-btn-text">
                  <span className="level-btn-name">Confirmé</span>
                  <span className="level-btn-exp">3 – 5 ans</span>
                </div>
              </button>

              <button type="button" className="career-level-btn" data-level="senior">
                <span className="level-btn-badge">N4</span>
                <div className="level-btn-text">
                  <span className="level-btn-name">Senior</span>
                  <span className="level-btn-exp">5 – 8 ans</span>
                </div>
              </button>

              <button type="button" className="career-level-btn" data-level="expert">
                <span className="level-btn-badge">N5</span>
                <div className="level-btn-text">
                  <span className="level-btn-name">Expert / Lead</span>
                  <span className="level-btn-exp">8+ ans</span>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="career-action-row" style={{ marginTop: '26px' }}>
            <button type="button" className="btn-primary btn-career-analyze" id="btn-career-simulate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Générer l'évaluation salariale
            </button>
            <button type="button" className="btn-ghost btn-career-reset" id="btn-career-reset">
              Réinitialiser
            </button>
          </div>

          {/* Simulation Results Output */}
          <div className="career-results-output" id="career-results-output" style={{ display: 'none' }}></div>
        </div>
      </div>
    </section>
  );
}
