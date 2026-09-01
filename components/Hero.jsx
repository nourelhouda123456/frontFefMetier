'use client';

import React from 'react';

export default function Hero() {
  return (
    <section className="hero-band" id="explore-zone">
      <div className="hero-grid-overlay"></div>
      <div className="hero-content">
        
        {/* Capsule Badge avec les couleurs harmonisées */}
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span data-i18n="hero_badge">🇹🇳 RTMC (Tunisie) &amp; 🇪🇺 ESCO (Europe) · Référentiel Commun</span>
        </div>

        {/* Titre authentique avec touche de couleur harmonisée */}
        <h1 className="hero-title">
          Découvrez le <span className="hero-title-highlight">métier qui vous correspond</span>
        </h1>
        
        <p className="hero-subtitle">
          Explorez les métiers, les compétences et les passerelles des référentiels RTMC (Tunisie 🇹🇳) et ESCO (Europe 🇪🇺).
        </p>

        {/* REFERENTIAL SOURCE FILTER TABS */}
        <div className="hero-source-filter">
          <div className="source-filter-tabs" id="source-filter-tabs">
            <button className="source-tab active" data-source="all">🌐 Tous <span className="tab-count" id="count-all">3 468</span></button>
            <button className="source-tab" data-source="rtmc">🇹🇳 RTMC <span className="tab-count" id="count-rtmc">530</span></button>
            <button className="source-tab" data-source="esco">🇪🇺 ESCO <span className="tab-count" id="count-esco">2 938</span></button>
          </div>
        </div>

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
          <span className="results-count" id="results-count">3 468 métiers disponibles</span>
          <button className="btn-clear-filters" id="btn-clear-filters" style={{ display: 'none' }} data-i18n="btn_clear">✕ Effacer les filtres</button>
        </div>
      </div>
    </section>
  );
}
