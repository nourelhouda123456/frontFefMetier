'use client';

import React from 'react';

export default function Hero() {
  return (
    <section className="hero-band" id="explore-zone">
      <div className="hero-grid-overlay"></div>
      <div className="hero-content">
        
        {/* Capsule Badge */}
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span data-i18n="hero_badge">Référentiel National des Métiers &amp; Compétences</span>
        </div>

        {/* Titre authentique avec touche de couleur harmonisée */}
        <h1 className="hero-title">
          Découvrez le <span className="hero-title-highlight">métier qui vous correspond</span>
        </h1>
        
        <p className="hero-subtitle">
          Explorez les métiers, les compétences clés et les passerelles de carrière au sein du référentiel unifié.
        </p>

        {/* SEARCH BAR UNIFIED (Filter + Search) */}
        <div className="search-wrap unified-search-wrap" id="search-wrap">
          <form className="search-bar unified-search-bar" id="hero-search-form" autoComplete="off">
            
            {/* Custom Inline Domain Dropdown */}
            <div className="inline-domain-wrap" id="custom-domain-wrap">
              <div className="custom-domain-trigger" id="custom-domain-trigger">
                <span className="trigger-text" id="custom-domain-text">Tous les domaines</span>
                <span className="caret"></span>
              </div>
              <div className="custom-domain-menu suggestions-box" id="custom-domain-menu">
                {/* Options rendered via JS */}
              </div>
            </div>

            <div className="search-divider"></div>

            <span className="search-icon">🔍</span>
            <input type="text" id="hero-search-input" data-i18n-placeholder="search_placeholder" placeholder="Rechercher un métier, une compétence…" />
            <button type="submit" id="btn-search" data-i18n="btn_search">Rechercher</button>
          </form>
          <div className="suggestions-box" id="search-suggestions"></div>
        </div>

        {/* RESULTS INFO BAR */}
        <div className="results-bar" id="results-bar">
          <span className="results-count" id="results-count">3 346 métiers disponibles</span>
          <button className="btn-clear-filters" id="btn-clear-filters" style={{ display: 'none' }} data-i18n="btn_clear">✕ Effacer les filtres</button>
        </div>
      </div>
    </section>
  );
}
