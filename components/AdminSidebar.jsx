'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSidebar({ section, onSectionChange, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();

  function navigate(s) {
    onSectionChange(s);
    onMobileClose(); // ferme le drawer mobile après sélection
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="admin-sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">M</div>
          <div>
            <strong>metierRef</strong>
            <small>Admin</small>
          </div>
          {/* Bouton fermer sur mobile */}
          <button
            className="admin-sidebar-close"
            onClick={onMobileClose}
            aria-label="Fermer le menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${section === 'metiers' ? 'active' : ''}`}
            onClick={() => navigate('metiers')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Métiers
          </button>
          <button
            className={`admin-nav-item ${section === 'domaines' ? 'active' : ''}`}
            onClick={() => navigate('domaines')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            Domaines
          </button>
          <a
            href="/"
            className="admin-nav-item"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMobileClose}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Voir le site
          </a>
        </nav>

        {/* Profil + déconnexion */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-sidebar-user-info">
              <p className="admin-sidebar-user-email">{user?.email}</p>
              <p className="admin-sidebar-user-role">{user?.role}</p>
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-logout" onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
