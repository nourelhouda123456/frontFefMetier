'use client';

import React, { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            className="mobile-menu-toggle" 
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
      
      {/* Menu Mobile Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} id="mobile-menu-overlay">
        <div className="mobile-menu-content">
          <a href="#explore-zone" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🏠 Accueil</a>
          <a href="#skills-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🎯 Compétences</a>
          <a href="#career-salary-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📊 Niveaux et Rémunérations IA</a>
          <a href="#mobility-section" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🔄 Mobilité &amp; Reconversion</a>
        </div>
      </div>
    </header>
  );
}
