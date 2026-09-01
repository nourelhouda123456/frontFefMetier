'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchDomaines } from '../lib/api';

const EMPTY_FORM = {
  titre: '',
  code: '',
  source: 'rtmc',
  domaine: '',
  domaineGrand: '',
  domaineProfessionnel: '',
  resume: '',
  definition: '',
  accesEmploi: '',
  active: true,
};

function parseList(value) {
  if (Array.isArray(value)) return value.join('\n');
  return value || '';
}

function toList(value) {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MetierFormModal({ metier, onClose, onSave }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [domaines, setDomaines]   = useState([]);
  const firstInputRef = useRef(null);

  const isEdit = Boolean(metier?._id);

  // Charger la liste des domaines actifs
  useEffect(() => {
    fetchDomaines()
      .then(setDomaines)
      .catch(() => setDomaines([]));
  }, []);

  useEffect(() => {
    if (metier) {
      setForm({
        titre:                           metier.titre                           || '',
        code:                            metier.code                            || '',
        source:                          metier.source                          || 'rtmc',
        domaine:                         metier.domaine                         || '',
        domaineGrand:                    metier.domaineGrand                    || '',
        domaineProfessionnel:            metier.domaineProfessionnel            || '',
        resume:                          metier.resume                          || '',
        definition:                      metier.definition                      || '',
        accesEmploi:                     metier.accesEmploi                     || '',
        active:                          metier.active !== false,
        competencesTechniquesSavoirFaire: parseList(metier.competencesTechniquesSavoirFaire),
        competencesTechniquesSavoir:      parseList(metier.competencesTechniquesSavoir),
        competencesComportementales:      parseList(metier.competencesComportementales),
        competencesNumeriques:            parseList(metier.competencesNumeriques),
        appellations:                    parseList(metier.appellations),
      });
    } else {
      setForm({ ...EMPTY_FORM,
        competencesTechniquesSavoirFaire: '',
        competencesTechniquesSavoir: '',
        competencesComportementales: '',
        competencesNumeriques: '',
        appellations: '',
      });
    }
    setErrors({});
    setActiveTab('general');
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [metier]);

  // Fermer avec Echap
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validate() {
    const e = {};
    if (!form.titre.trim()) e.titre = 'Le titre est obligatoire.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); setActiveTab('general'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        titre:  form.titre.trim(),
        code:   form.code.trim().toUpperCase() || undefined,
        active: form.active,
        competencesTechniquesSavoirFaire: toList(form.competencesTechniquesSavoirFaire || ''),
        competencesTechniquesSavoir:      toList(form.competencesTechniquesSavoir      || ''),
        competencesComportementales:      toList(form.competencesComportementales      || ''),
        competencesNumeriques:            toList(form.competencesNumeriques            || ''),
        appellations:                    toList(form.appellations                      || ''),
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'general',      label: 'Général',       icon: '📋' },
    { id: 'description',  label: 'Description',   icon: '📝' },
    { id: 'competences',  label: 'Compétences',   icon: '🎯' },
  ];

  return (
    <div className="admin-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label={isEdit ? 'Modifier un métier' : 'Ajouter un métier'}>
      <div className="admin-modal">
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title-group">
            <div className="admin-modal-icon">{isEdit ? '✏️' : '➕'}</div>
            <div>
              <h2 className="admin-modal-title">{isEdit ? 'Modifier le métier' : 'Ajouter un métier'}</h2>
              {isEdit && <p className="admin-modal-subtitle">{metier.titre}</p>}
            </div>
          </div>
          <button className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-modal-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-modal-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-modal-body">

            {/* Tab : Général */}
            {activeTab === 'general' && (
              <div className="admin-form-grid">
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-titre">
                    Titre <span className="admin-required">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="f-titre"
                    type="text"
                    className={`admin-input ${errors.titre ? 'admin-input-error' : ''}`}
                    placeholder="Ex : Développeur web"
                    value={form.titre}
                    onChange={(e) => set('titre', e.target.value)}
                  />
                  {errors.titre && <p className="admin-field-error">{errors.titre}</p>}
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-code">Code</label>
                  <input
                    id="f-code"
                    type="text"
                    className="admin-input"
                    placeholder="Ex : M1805"
                    value={form.code}
                    onChange={(e) => set('code', e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-source">Source</label>
                  <select id="f-source" className="admin-input admin-select" value={form.source} onChange={(e) => set('source', e.target.value)}>
                    <option value="rtmc">RTMC (Tunisie 🇹🇳)</option>
                    <option value="esco">ESCO (Europe 🇪🇺)</option>
                  </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-domaine">Domaine</label>
                  <select id="f-domaine" className="admin-input admin-select" value={form.domaine} onChange={(e) => set('domaine', e.target.value)}>
                    <option value="">— Sélectionner un domaine —</option>
                    {domaines.map(d => (
                      <option key={d._id} value={d.nom}>{d.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-domaineGrand">Grand domaine</label>
                  <select id="f-domaineGrand" className="admin-input admin-select" value={form.domaineGrand} onChange={(e) => set('domaineGrand', e.target.value)}>
                    <option value="">— Sélectionner un grand domaine —</option>
                    {domaines.map(d => (
                      <option key={d._id} value={d.nom}>{d.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-domainePro">Domaine professionnel</label>
                  <input id="f-domainePro" type="text" className="admin-input" placeholder="Ex : Développement logiciel" value={form.domaineProfessionnel} onChange={(e) => set('domaineProfessionnel', e.target.value)} />
                </div>

                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-appellations">
                    Appellations <small className="admin-label-hint">(une par ligne)</small>
                  </label>
                  <textarea id="f-appellations" className="admin-input admin-textarea admin-textarea-sm" placeholder="Développeur full-stack&#10;Ingénieur web" value={form.appellations || ''} onChange={(e) => set('appellations', e.target.value)} />
                </div>

                <div className="admin-field admin-field-full">
                  <div className="admin-toggle-row">
                    <div>
                      <p className="admin-label">Statut</p>
                      <p className="admin-label-hint">Un métier désactivé ne sera plus visible dans le référentiel public.</p>
                    </div>
                    <label className="admin-toggle" htmlFor="f-active">
                      <input id="f-active" type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>
                  <p className="admin-field-hint">
                    Statut actuel : <span className={form.active ? 'admin-badge admin-badge-success' : 'admin-badge admin-badge-muted'}>
                      {form.active ? 'Actif' : 'Désactivé'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Tab : Description */}
            {activeTab === 'description' && (
              <div className="admin-form-grid">
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-resume">Résumé</label>
                  <textarea id="f-resume" className="admin-input admin-textarea" placeholder="Courte description du métier..." value={form.resume} onChange={(e) => set('resume', e.target.value)} />
                </div>
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-definition">Définition</label>
                  <textarea id="f-definition" className="admin-input admin-textarea" placeholder="Définition détaillée du métier..." value={form.definition} onChange={(e) => set('definition', e.target.value)} />
                </div>
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-acces">Accès à l&apos;emploi / Formation</label>
                  <textarea id="f-acces" className="admin-input admin-textarea" placeholder="Diplômes requis, formations recommandées..." value={form.accesEmploi} onChange={(e) => set('accesEmploi', e.target.value)} />
                </div>
              </div>
            )}

            {/* Tab : Compétences */}
            {activeTab === 'competences' && (
              <div className="admin-form-grid">
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-savoirFaire">
                    Savoir-faire techniques <small className="admin-label-hint">(une par ligne)</small>
                  </label>
                  <textarea id="f-savoirFaire" className="admin-input admin-textarea" placeholder="Développer des applications web&#10;Maîtriser les bases de données&#10;..." value={form.competencesTechniquesSavoirFaire || ''} onChange={(e) => set('competencesTechniquesSavoirFaire', e.target.value)} />
                </div>
                <div className="admin-field admin-field-full">
                  <label className="admin-label" htmlFor="f-savoir">
                    Savoirs techniques <small className="admin-label-hint">(une par ligne)</small>
                  </label>
                  <textarea id="f-savoir" className="admin-input admin-textarea" placeholder="Algorithmes et structures de données&#10;Protocoles réseau&#10;..." value={form.competencesTechniquesSavoir || ''} onChange={(e) => set('competencesTechniquesSavoir', e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-comportementales">
                    Compétences comportementales <small className="admin-label-hint">(une par ligne)</small>
                  </label>
                  <textarea id="f-comportementales" className="admin-input admin-textarea admin-textarea-sm" placeholder="Esprit d'équipe&#10;Rigueur&#10;..." value={form.competencesComportementales || ''} onChange={(e) => set('competencesComportementales', e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="f-numeriques">
                    Compétences numériques <small className="admin-label-hint">(une par ligne)</small>
                  </label>
                  <textarea id="f-numeriques" className="admin-input admin-textarea admin-textarea-sm" placeholder="Maîtrise des outils bureautiques&#10;..." value={form.competencesNumeriques || ''} onChange={(e) => set('competencesNumeriques', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? (
                <><div className="admin-spinner admin-spinner-sm admin-spinner-white"></div> Enregistrement…</>
              ) : (
                <>{isEdit ? '💾 Enregistrer les modifications' : '➕ Créer le métier'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
