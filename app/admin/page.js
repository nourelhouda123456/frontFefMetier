'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  adminFetchMetiers,
  adminDeleteMetier,
  adminCreateMetier,
  adminUpdateMetier,
  adminToggleMetier,
} from '../../lib/api';
import AdminSidebar    from '../../components/AdminSidebar';
import MetierFormModal from '../../components/MetierFormModal';
import DomainesSection from '../../components/DomainesSection';

const PAGE_SIZE = 20;

// ── Dialogue de confirmation ──────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, danger }) {
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-confirm-dialog">
        <div className="admin-confirm-icon">{danger ? '🗑️' : '⚠️'}</div>
        <p className="admin-confirm-message">{message}</p>
        <div className="admin-confirm-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Annuler</button>
          <button
            className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={onConfirm}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section Métiers ───────────────────────────────────────────────────────────
function MetiersSection({ token, showToast }) {
  const [metiers, setMetiers]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(1);
  const [page, setPage]                 = useState(1);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [source, setSource]             = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const searchTimeout                   = useRef(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editMetier, setEditMetier]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const loadMetiers = useCallback(async (opts = {}) => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const result = await adminFetchMetiers(token, {
        search: opts.search !== undefined ? opts.search : search,
        source: opts.source !== undefined ? opts.source : source,
        active: opts.active !== undefined ? opts.active : activeFilter,
        page:   opts.page   !== undefined ? opts.page   : page,
        limit:  PAGE_SIZE,
      });
      setMetiers(result.data);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setFetchLoading(false);
    }
  }, [token, search, source, activeFilter, page, showToast]);

  useEffect(() => { loadMetiers(); }, []); // eslint-disable-line

  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); loadMetiers({ search: val, page: 1 }); }, 350);
  }

  function handleFilterChange(field, val) {
    if (field === 'source') setSource(val);
    if (field === 'active') setActiveFilter(val);
    setPage(1);
    loadMetiers({ [field]: val, page: 1 });
  }

  function handlePageChange(p) { setPage(p); loadMetiers({ page: p }); }
  function openCreate() { setEditMetier(null); setModalOpen(true); }
  function openEdit(m)  { setEditMetier(m);    setModalOpen(true); }

  async function handleSave(payload) {
    try {
      if (editMetier?._id) {
        await adminUpdateMetier(token, editMetier._id, payload);
        showToast('success', `"${payload.titre}" mis à jour.`);
      } else {
        await adminCreateMetier(token, payload);
        showToast('success', `"${payload.titre}" créé.`);
      }
      setModalOpen(false);
      setPage(1);
      loadMetiers({ page: 1 });
    } catch (err) {
      showToast('error', err.message);
      throw err;
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await adminDeleteMetier(token, confirmDelete.id);
      showToast('success', `"${confirmDelete.titre}" supprimé.`);
      loadMetiers();
    } catch (err) {
      showToast('error', err.message);
    } finally { setConfirmDelete(null); }
  }

  async function handleToggle() {
    if (!confirmToggle) return;
    try {
      const result = await adminToggleMetier(token, confirmToggle.id);
      showToast('success', `"${confirmToggle.titre}" ${result.active ? 'activé' : 'désactivé'}.`);
      loadMetiers();
    } catch (err) {
      showToast('error', err.message);
    } finally { setConfirmToggle(null); }
  }

  return (
    <>
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <h1 className="admin-page-title">Gestion des métiers</h1>
          <p className="admin-page-subtitle">
            {total > 0 ? `${total.toLocaleString()} métier${total > 1 ? 's' : ''}` : 'Aucun métier'}
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="admin-btn-label">Ajouter un métier</span>
        </button>
      </header>

      {/* Filtres */}
      <div className="admin-filters">
        <div className="admin-search-wrapper">
          <svg className="admin-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            className="admin-input admin-search-input"
            placeholder="Titre, code, domaine…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {search && (
            <button className="admin-search-clear" onClick={() => handleSearchChange('')} aria-label="Effacer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <select className="admin-input admin-select admin-filter-select" value={source} onChange={e => handleFilterChange('source', e.target.value)}>
          <option value="">Toutes les sources</option>
          <option value="rtmc">RTMC 🇹🇳</option>
          <option value="esco">ESCO 🇪🇺</option>
        </select>
        <select className="admin-input admin-select admin-filter-select" value={activeFilter} onChange={e => handleFilterChange('active', e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Désactivés</option>
        </select>
        <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => loadMetiers()} aria-label="Actualiser">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>

      {/* Tableau */}
      <div className="admin-table-wrapper">
        {fetchLoading ? (
          <div className="admin-table-loading">
            <div className="admin-spinner"></div><p>Chargement…</p>
          </div>
        ) : metiers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🔍</div>
            <h3>Aucun métier trouvé</h3>
            <p>{search ? `Aucun résultat pour « ${search} »` : 'Commencez par ajouter un métier.'}</p>
            {!search && <button className="admin-btn admin-btn-primary" onClick={openCreate}>Ajouter le premier métier</button>}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th className="admin-col-hide-sm">Code</th>
                <th className="admin-col-hide-sm">Source</th>
                <th className="admin-col-hide-md">Domaine</th>
                <th>Statut</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metiers.map(m => (
                <tr key={m._id} className={m.active === false ? 'admin-row-inactive' : ''}>
                  <td className="admin-td-titre">
                    <span className="admin-titre-text" title={m.titre}>{m.titre}</span>
                    {/* Sur mobile : afficher source + code sous le titre */}
                    <span className="admin-titre-meta admin-col-show-sm">
                      {m.code && <span className="admin-code-badge">{m.code}</span>}
                      <span className={`admin-badge ${m.source === 'esco' ? 'admin-badge-esco' : 'admin-badge-rtmc'}`} style={{ fontSize: 11 }}>
                        {m.source === 'esco' ? '🇪🇺' : '🇹🇳'} {m.source?.toUpperCase()}
                      </span>
                    </span>
                  </td>
                  <td className="admin-col-hide-sm">
                    {m.code ? <span className="admin-code-badge">{m.code}</span> : <span className="admin-na">—</span>}
                  </td>
                  <td className="admin-col-hide-sm">
                    <span className={`admin-badge ${m.source === 'esco' ? 'admin-badge-esco' : 'admin-badge-rtmc'}`}>
                      {m.source === 'esco' ? '🇪🇺 ESCO' : '🇹🇳 RTMC'}
                    </span>
                  </td>
                  <td className="admin-col-hide-md admin-td-domaine">
                    {m.domaineGrand || m.domaine || '—'}
                  </td>
                  <td>
                    <button
                      className={`admin-badge admin-badge-btn ${m.active !== false ? 'admin-badge-success' : 'admin-badge-muted'}`}
                      onClick={() => setConfirmToggle({ id: m._id, titre: m.titre, active: m.active !== false })}
                    >
                      {m.active !== false ? '✓' : '✗'}
                      <span className="admin-col-hide-sm">{m.active !== false ? ' Actif' : ' Off'}</span>
                    </button>
                  </td>
                  <td className="admin-td-actions">
                    <div className="admin-actions">
                      <button className="admin-action-btn admin-action-edit" onClick={() => openEdit(m)} aria-label={`Modifier ${m.titre}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span className="admin-col-hide-sm">Modifier</span>
                      </button>
                      <button className="admin-action-btn admin-action-delete" onClick={() => setConfirmDelete({ id: m._id, titre: m.titre })} aria-label={`Supprimer ${m.titre}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        <span className="admin-col-hide-sm">Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="admin-pagination">
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => handlePageChange(page - 1)} disabled={page <= 1} aria-label="Précédent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            let p;
            if (pages <= 7)             p = i + 1;
            else if (page <= 4)         p = i + 1;
            else if (page >= pages - 3) p = pages - 6 + i;
            else                        p = page - 3 + i;
            return (
              <button
                key={p}
                className={`admin-btn admin-btn-page ${page === p ? 'active' : 'admin-btn-ghost'}`}
                onClick={() => handlePageChange(p)}
                aria-current={page === p ? 'page' : undefined}
              >{p}</button>
            );
          })}
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => handlePageChange(page + 1)} disabled={page >= pages} aria-label="Suivant">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <span className="admin-pagination-info">Page {page}/{pages} — {total.toLocaleString()}</span>
        </div>
      )}

      {modalOpen && (
        <MetierFormModal metier={editMetier} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
      {confirmDelete && (
        <ConfirmDialog danger message={`Supprimer "${confirmDelete.titre}" ? Action irréversible.`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
      )}
      {confirmToggle && (
        <ConfirmDialog message={`${confirmToggle.active ? 'Désactiver' : 'Activer'} "${confirmToggle.titre}" ?`} onConfirm={handleToggle} onCancel={() => setConfirmToggle(null)} />
      )}
    </>
  );
}

// ── Page principale Admin ─────────────────────────────────────────────────────
export default function AdminPage() {
  const { token, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [section, setSection]         = useState('metiers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast]             = useState(null);
  const toastTimeout                  = useRef(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/admin/login');
  }, [loading, isAuthenticated, router]);

  function showToast(type, message) {
    clearTimeout(toastTimeout.current);
    setToast({ type, message });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="admin-page-loader">
        <div className="admin-spinner admin-spinner-lg"></div>
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {/* Sidebar (composant réutilisable) */}
      <AdminSidebar
        section={section}
        onSectionChange={setSection}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Contenu principal */}
      <div className="admin-content">
        {/* Barre de navigation mobile (hamburger) */}
        <div className="admin-mobile-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <span/><span/><span/>
          </button>
          <div className="admin-mobile-brand">
            <span className="admin-sidebar-logo" style={{ width: 28, height: 28, fontSize: 13 }}>M</span>
            <strong>metierRef</strong>
            <small>Admin</small>
          </div>
        </div>

        {/* Section active */}
        <main className="admin-main">
          {section === 'metiers'  && <MetiersSection  token={token} showToast={showToast} />}
          {section === 'domaines' && <DomainesSection token={token} showToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`} role="alert">
          {toast.type === 'success'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.message}
        </div>
      )}
    </div>
  );
}
