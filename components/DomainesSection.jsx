'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminFetchDomaines,
  adminCreateDomaine,
  adminUpdateDomaine,
  adminDeleteDomaine,
  adminToggleDomaine,
} from '../lib/api';

// ── Formulaire inline ────────────────────────────────────────────────────────
function DomaineForm({ initial, onSave, onCancel }) {
  const [nom, setNom]       = useState(initial?.nom || '');
  const [active, setActive] = useState(initial?.active !== false);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nom.trim()) { setError('Le nom est obligatoire.'); return; }
    setSaving(true);
    try {
      await onSave({ nom: nom.trim(), active });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="domaine-form" noValidate>
      {error && <p className="admin-field-error" style={{ marginBottom: 10 }}>{error}</p>}
      <div className="domaine-form-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label className="admin-label" htmlFor="df-nom">
            Nom du domaine <span className="admin-required">*</span>
          </label>
          <input
            ref={inputRef}
            id="df-nom"
            type="text"
            className="admin-input"
            placeholder="Ex : Informatique et numérique"
            value={nom}
            onChange={e => { setNom(e.target.value); setError(''); }}
          />
        </div>
        <div className="admin-field" style={{ flexShrink: 0 }}>
          <label className="admin-label">Statut</label>
          <label className="admin-toggle" style={{ marginTop: 6 }}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            <span className="admin-toggle-slider"></span>
          </label>
        </div>
      </div>
      <div className="domaine-form-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving
            ? <><div className="admin-spinner admin-spinner-sm admin-spinner-white"></div> Enregistrement…</>
            : initial ? '💾 Enregistrer' : '➕ Ajouter le domaine'
          }
        </button>
      </div>
    </form>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function DomainesSection({ token, showToast }) {
  const [domaines, setDomaines]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const searchTimeout                     = useRef(null);
  const [showForm, setShowForm]           = useState(false);
  const [editId, setEditId]               = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const result = await adminFetchDomaines(token, {
        search: opts.search !== undefined ? opts.search : search,
        limit: 100,
      });
      setDomaines(result.data);
      setTotal(result.total);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, showToast]);

  useEffect(() => { load(); }, []); // eslint-disable-line

  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load({ search: val }), 350);
  }

  async function handleCreate(payload) {
    await adminCreateDomaine(token, payload);
    showToast('success', `Domaine "${payload.nom}" créé.`);
    setShowForm(false);
    load();
  }

  async function handleUpdate(id, payload) {
    await adminUpdateDomaine(token, id, payload);
    showToast('success', `Domaine "${payload.nom}" mis à jour.`);
    setEditId(null);
    load();
  }

  async function handleToggle(id, nom) {
    try {
      const result = await adminToggleDomaine(token, id);
      showToast('success', `"${nom}" ${result.active ? 'activé' : 'désactivé'}.`);
      load();
    } catch (err) {
      showToast('error', err.message);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await adminDeleteDomaine(token, confirmDelete.id);
      showToast('success', `Domaine "${confirmDelete.nom}" supprimé.`);
      load();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div className="domaines-section">

      {/* Header */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1 className="admin-page-title">Gestion des domaines</h1>
          <p className="admin-page-subtitle">
            {total > 0 ? `${total} domaine${total > 1 ? 's' : ''}` : 'Aucun domaine'}
          </p>
        </div>
        {!showForm && (
          <button className="admin-btn admin-btn-primary" onClick={() => { setShowForm(true); setEditId(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter un domaine
          </button>
        )}
      </header>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="domaine-form-wrapper">
          <p className="domaine-form-title">Nouveau domaine</p>
          <DomaineForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Barre de recherche */}
      <div className="admin-filters">
        <div className="admin-search-wrapper" style={{ maxWidth: 360 }}>
          <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            className="admin-input admin-search-input"
            placeholder="Rechercher un domaine…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {search && (
            <button className="admin-search-clear" onClick={() => handleSearchChange('')} aria-label="Effacer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => load()} title="Actualiser" aria-label="Actualiser">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>

      {/* Tableau */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-table-loading">
            <div className="admin-spinner"></div>
            <p>Chargement…</p>
          </div>
        ) : domaines.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🗂️</div>
            <h3>Aucun domaine{search ? ` pour « ${search} »` : ''}</h3>
            {!search && (
              <button className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}>
                Ajouter le premier domaine
              </button>
            )}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom du domaine</th>
                <th>Statut</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domaines.map((d, index) => (
                <React.Fragment key={d._id}>
                  <tr className={d.active === false ? 'admin-row-inactive' : ''}>
                    <td style={{ color: 'var(--muted-foreground)', fontSize: 13, width: 40 }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.nom}</td>
                    <td>
                      <button
                        className={`admin-badge admin-badge-btn ${d.active !== false ? 'admin-badge-success' : 'admin-badge-muted'}`}
                        onClick={() => handleToggle(d._id, d.nom)}
                        title={d.active !== false ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                      >
                        {d.active !== false ? '✓ Actif' : '✗ Désactivé'}
                      </button>
                    </td>
                    <td className="admin-td-actions">
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn admin-action-edit"
                          onClick={() => { setEditId(editId === d._id ? null : d._id); setShowForm(false); }}
                          title="Modifier"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Modifier
                        </button>
                        <button
                          className="admin-action-btn admin-action-delete"
                          onClick={() => setConfirmDelete({ id: d._id, nom: d.nom })}
                          title="Supprimer"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Formulaire d'édition inline */}
                  {editId === d._id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0, background: '#f8f9fb' }}>
                        <div className="domaine-form-wrapper domaine-form-edit">
                          <p className="domaine-form-title">Modifier : <strong>{d.nom}</strong></p>
                          <DomaineForm
                            initial={d}
                            onSave={(payload) => handleUpdate(d._id, payload)}
                            onCancel={() => setEditId(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-confirm-dialog">
            <div className="admin-confirm-icon">🗑️</div>
            <p className="admin-confirm-message">
              Supprimer le domaine <strong>« {confirmDelete.nom} »</strong> ?<br />
              <small style={{ color: 'var(--muted-foreground)' }}>Les métiers associés ne seront pas supprimés.</small>
            </p>
            <div className="admin-confirm-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
