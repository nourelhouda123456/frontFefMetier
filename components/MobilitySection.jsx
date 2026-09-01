'use client';

import React from 'react';

export default function MobilitySection() {
  return (
    <section className="mobility-section" id="mobility-section">
      <div className="container">
        {/* Section Header */}
        <div className="mobility-section-header">
          <div className="mobility-section-header-left">
            <span className="section-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
              PASSERELLES &amp; TRANSFÉRABILITÉ DES COMPÉTENCES
            </span>
            <h2 className="mobility-section-title">Matrice de Mobilité et Analyse d'Adéquation</h2>
            <p className="mobility-section-desc">
              Évaluez la transférabilité des compétences entre deux métiers du référentiel, mesurez le taux de recouvrement et identifiez les compétences clés à développer.
            </p>
          </div>
          <div className="mobility-section-header-right">
            <div className="mobility-stat-pill">💼 3 340+ Métiers</div>
            <div className="mobility-stat-pill">🎯 4 500+ Passerelles</div>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="mobility-steps-row">
          <div className="mobility-step active">
            <span className="mobility-step-num">1</span>
            <span className="mobility-step-label">Métier d'origine (A)</span>
          </div>
          <div className="mobility-step-line"></div>
          <div className="mobility-step active">
            <span className="mobility-step-num">2</span>
            <span className="mobility-step-label">Métier cible (B)</span>
          </div>
          <div className="mobility-step-line"></div>
          <div className="mobility-step" id="mobility-step-result">
            <span className="mobility-step-num">3</span>
            <span className="mobility-step-label">Rapport d'évaluation</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="mobility-box">
          <div className="mobility-form-row">
            {/* Source Job A */}
            <div className="mobility-field-group">
              <label htmlFor="mobility-input-source">
                <span className="mobility-field-badge mobility-field-badge-a">A</span>
                Métier d'origine ou profil actuel
              </label>
              <div className="mobility-input-wrap">
                <span className="mobility-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input type="text" id="mobility-input-source" placeholder="Rechercher par intitulé ou code (ex : Électromécanicien, A1101...)" autoComplete="off" />
                <div className="mobility-sugg-box" id="mobility-sugg-source"></div>
              </div>
            </div>

            <div className="mobility-arrow-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            {/* Target Job B */}
            <div className="mobility-field-group">
              <label htmlFor="mobility-input-target">
                <span className="mobility-field-badge mobility-field-badge-b">B</span>
                Métier cible envisagé
              </label>
              <div className="mobility-input-wrap">
                <span className="mobility-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </span>
                <input type="text" id="mobility-input-target" placeholder="Rechercher le métier visé (ex : Développeur web, Technicien...)" autoComplete="off" />
                <div className="mobility-sugg-box" id="mobility-sugg-target"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mobility-action-group">
              <button className="btn-primary btn-mobility-analyze" id="btn-analyze-mobility">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Analyser la passerelle
              </button>
              <button className="btn-mobility-reset" id="btn-reset-mobility" title="Réinitialiser le formulaire">
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Analysis Results Output */}
          <div className="mobility-results-output" id="mobility-results-output" style={{ display: 'none' }}>
            {/* Rendered via JS */}
          </div>
        </div>
      </div>
    </section>
  );
}
