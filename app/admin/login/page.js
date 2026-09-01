'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminLoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin');
    } catch (err) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-loader">
          <div className="admin-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo / Branding */}
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <span>M</span>
          </div>
          <div>
            <h1 className="admin-login-title">metierRef</h1>
            <p className="admin-login-subtitle">Espace Administrateur</p>
          </div>
        </div>

        <h2 className="admin-login-heading">Connexion</h2>
        <p className="admin-login-desc">Accédez au tableau de bord de gestion des métiers.</p>

        <div className="admin-login-restricted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Accès réservé aux administrateurs autorisés
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="admin-field">
            <label className="admin-label" htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="admin-input"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="password">Mot de passe</label>
            <div className="admin-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input admin-input-with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary admin-btn-full" disabled={submitting}>
            {submitting ? (
              <>
                <div className="admin-spinner admin-spinner-sm"></div>
                Connexion en cours…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Se connecter
              </>
            )}
          </button>
        </form>

        <p className="admin-login-back">
          <a href="/" className="admin-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Retour à l&apos;application
          </a>
        </p>
      </div>
    </div>
  );
}
