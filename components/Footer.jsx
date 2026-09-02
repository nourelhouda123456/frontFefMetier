'use client';

import React from 'react';

export default function Footer() {
  return (
    <>
      <section className="cta-band">
        <div className="container">
          <h2 data-i18n="cta_footer_title">Votre prochaine opportunité commence par une découverte</h2>
          <p data-i18n="cta_footer_text">Explorez les métiers et découvrez les compétences qui façonnent le monde professionnel.</p>
          <a href="#explore-zone" className="btn-primary" data-i18n="btn_explore">Explorer les métiers</a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-cols">
            <div className="footer-brand-col">
              <div className="brand">
                <span className="brand-logo">M</span>
                <strong>metierRef</strong>
              </div>
              <p data-i18n="footer_desc">Plateforme d'exploration et d'orientation professionnelle. Consultez les fiches métiers, compétences et grilles salariales.</p>
            </div>
            <div>
              <h4>Navigation</h4>
              <ul className="footer-links">
                <li><a href="#explore-zone" data-i18n="nav_home">Accueil</a></li>
                <li><a href="#skills-section" data-i18n="nav_skills">Compétences</a></li>
              </ul>
            </div>
            <div>
              <h4 data-i18n="footer_sources">À propos</h4>
              <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.7 }} data-i18n="footer_legal">
                Données officielles des métiers, compétences clés et grilles de qualification.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 metierRef · Référentiel des Métiers &amp; Compétences</span>
            <a href="/admin/login" className="footer-admin-link" title="Accès réservé aux administrateurs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Espace administrateur
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
