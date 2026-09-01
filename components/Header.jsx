'use client';

import React, { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <header className="header" id="main-header">
      <div className="header-inner">
        <a className="brand" href="/">
          <span className="brand-logo">M</span>
          <div className="brand-text">
            <strong>metierRef</strong>
            <small>Plateforme Commune RTMC 🇹🇳 &amp; ESCO 🇪🇺</small>
          </div>
        </a>
        
        {/* Navigation Desktop */}
        <nav className="header-nav" id="main-nav">
          <a href="#explore-zone" className="nav-link" data-i18n="nav_home">Accueil</a>
          <a href="#skills-section" className="nav-link" data-i18n="nav_skills">Compétences</a>
          <a href="#career-salary-section" className="nav-link" data-i18n="nav_salary">Niveaux et Rémunérations IA</a>
          <a href="#mobility-section" className="nav-link" data-i18n="nav_mobility">Mobilité &amp; Reconversion</a>
        </nav>
        
        <div className="header-actions">
          {/* Bouton Menu Mobile */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            id="mobile-menu-btn" 
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      {/* Menu Mobile Overlay (Solid Background & Highest Z-Index) */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} id="mobile-menu-overlay">
        <div className="mobile-menu-header">
          <a className="brand" href="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-logo">M</span>
            <div className="brand-text">
              <strong style={{ color: '#ffffff' }}>metierRef</strong>
              <small style={{ color: 'rgba(255,255,255,0.7)' }}>Référentiel RH</small>
            </div>
          </a>
          <button 
            className="mobile-menu-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu-content">
          <a href="#explore-zone" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="mn-icon">🏠</span>
            <span>Accueil</span>
          </a>
          <a href="#skills-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="mn-icon">🎯</span>
            <span>Compétences</span>
          </a>
          <a href="#career-salary-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="mn-icon">📊</span>
            <span>Niveaux et Rémunérations IA</span>
          </a>
          <a href="#mobility-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            <span className="mn-icon">🔄</span>
            <span>Mobilité &amp; Reconversion</span>
          </a>
        </div>
      </div>
    </header>
  );
}
