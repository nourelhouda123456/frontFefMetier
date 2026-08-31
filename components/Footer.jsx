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
              <p data-i18n="footer_desc">Plateforme commune d'exploration et d'orientation combinant le RTMC (Tunisie 🇹🇳) et l'ESCO (Europe 🇪🇺).</p>
            </div>
            <div>
              <h4>Navigation</h4>
              <ul className="footer-links">
                <li><a href="#explore-zone" data-i18n="nav_home">Accueil</a></li>
                <li><a href="#skills-section" data-i18n="nav_skills">Compétences</a></li>
              </ul>
            </div>
            <div>
              <h4 data-i18n="footer_sources">Sources</h4>
              <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.7 }} data-i18n="footer_legal">
                Données officielles ANETI / RTMC Tunisie &amp; Commission Européenne / ESCO.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 metierRef · Référentiel Commun RTMC 🇹🇳 &amp; ESCO 🇪🇺</span>
          </div>
        </div>
      </footer>
    </>
  );
}
