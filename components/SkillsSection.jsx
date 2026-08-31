'use client';

import React from 'react';

export default function SkillsSection() {
  return (
    <section className="section-alt" id="skills-section">
      <div className="container">
        <div className="section-head">
          <h2 data-i18n="skills_title">Les compétences au cœur de l'orientation</h2>
          <p data-i18n="skills_subtitle">Cliquez sur une compétence pour filtrer les métiers associés.</p>
        </div>
        <div className="skills-cloud" id="skills-cloud"></div>
      </div>
    </section>
  );
}
