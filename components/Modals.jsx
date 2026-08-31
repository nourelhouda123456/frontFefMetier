'use client';

import React from 'react';

export default function Modals() {
  return (
    <>
      {/* DRAWER (Fiche Métier) */}
      <div className="drawer-overlay" id="job-drawer" role="dialog" aria-modal="true" aria-label="Fiche métier">
        <div className="drawer-sheet">
          <div className="drawer-header">
            <span className="drawer-title">DOCUMENT OFFICIEL — FICHE MÉTIER</span>
            <button className="drawer-close" id="drawer-close" aria-label="Fermer">✕</button>
          </div>
          <div className="drawer-body" id="drawer-content"></div>
        </div>
      </div>

      {/* COMPARE MODAL */}
      <div className="modal-overlay" id="compare-modal" role="dialog" aria-modal="true">
        <div className="modal-box">
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-head-icon">⚖️</span>
              <span data-i18n="compare_modal_title">Comparateur de Métiers</span>
            </div>
            <button className="modal-close" id="btn-close-compare-modal" aria-label="Fermer">✕</button>
          </div>
          <div className="modal-body" id="comparison-content"></div>
        </div>
      </div>

      {/* FLOATING COMPARE BAR */}
      <div className="compare-bar" id="compare-bar" style={{ display: 'none' }}>
        <span id="compare-bar-count">0 métier(s)</span>
        <button className="btn-primary" id="btn-view-compare" data-i18n="btn_compare_label">Comparer</button>
        <button className="btn-ghost-sm" id="btn-clear-compare">✕</button>
      </div>

      {/* AI CHAT WIDGET */}
      <button className="chat-fab" id="chat-widget-trigger" aria-label="Assistant IA">💬</button>
      <div className="chat-window" id="chat-widget-window">
        <div className="chat-header">
          <span>Assistant IA RTMC</span>
          <button id="chat-widget-close">✕</button>
        </div>
        <div className="chat-messages" id="chat-widget-messages">
          <div className="chat-msg assistant">
            <div className="chat-bubble">Bonjour ! Posez-moi une question sur les métiers ou les compétences.</div>
          </div>
        </div>
        <form className="chat-input-row" id="chat-widget-form">
          <input type="text" id="chat-widget-input" placeholder="Votre question…" autoComplete="off" />
          <button type="submit">↑</button>
        </form>
      </div>
    </>
  );
}
