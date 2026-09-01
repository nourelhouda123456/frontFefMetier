const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000');

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Erreur de santé backend');
  return res.json();
}

export async function fetchMetiers() {
  const res = await fetch(`${API_BASE}/api/metiers`);
  if (!res.ok) throw new Error('Impossible de charger les métiers');
  return res.json();
}

export async function searchMetiers({ code, titre } = {}) {
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (titre) params.set('titre', titre);
  const res = await fetch(`${API_BASE}/api/metiers/search?${params.toString()}`);
  if (!res.ok) throw new Error('Recherche échouée');
  return res.json();
}

export async function fetchSimilarMetiers(url, limit = 5) {
  const params = new URLSearchParams({ url, limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/metiers/similar?${params.toString()}`);
  if (!res.ok) throw new Error('Impossible de récupérer les métiers similaires');
  return res.json();
}

export async function analyzeTransferability(sourceUrl, targetUrl) {
  const res = await fetch(`${API_BASE}/api/transferability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceUrl, targetUrl }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de l'analyse de transférabilité");
  }
  return res.json();
}

export async function calculateCareerSalary(jobUrl, level = 'junior') {
  const res = await fetch(`${API_BASE}/api/career-salary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobUrl, level }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors du calcul de rémunération');
  }
  return res.json();
}

export async function askChatbot(question) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la communication avec l'assistant");
  }
  return res.json();
}

export async function getRecommendations(cvText, limit = 5) {
  const res = await fetch(`${API_BASE}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText, limit }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de l'analyse du profil");
  }
  return res.json();
}

// ── Admin API ─────────────────────────────────────────────────────────────────

function adminHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Identifiants incorrects.');
  return data; // { token, user }
}

export async function adminGetMe(token) {
  const res = await fetch(`${API_BASE}/api/admin/me`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Non authentifié.');
  return data;
}

export async function adminFetchMetiers(token, { search = '', source = '', active = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (source) params.set('source', source);
  if (active !== '') params.set('active', active);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await fetch(`${API_BASE}/api/admin/metiers?${params.toString()}`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur chargement métiers.');
  return data; // { data, total, page, limit, pages }
}

export async function adminCreateMetier(token, metier) {
  const res = await fetch(`${API_BASE}/api/admin/metiers`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(metier),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création métier.');
  return data;
}

export async function adminUpdateMetier(token, id, metier) {
  const res = await fetch(`${API_BASE}/api/admin/metiers/${id}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(metier),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur modification métier.');
  return data;
}

export async function adminDeleteMetier(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/metiers/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur suppression métier.');
  return data;
}

export async function adminToggleMetier(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/metiers/${id}/toggle`, {
    method: 'PATCH',
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur activation/désactivation.');
  return data;
}

// ── Domaines publics ──────────────────────────────────────────────────────────

export async function fetchDomaines() {
  const res = await fetch(`${API_BASE}/api/domaines`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur chargement domaines.');
  return data; // tableau de domaines actifs
}

// ── Domaines admin ────────────────────────────────────────────────────────────

export async function adminFetchDomaines(token, { search = '', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/api/admin/domaines?${params.toString()}`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur chargement domaines.');
  return data; // { data, total, page, limit, pages }
}

export async function adminCreateDomaine(token, domaine) {
  const res = await fetch(`${API_BASE}/api/admin/domaines`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(domaine),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur création domaine.');
  return data;
}

export async function adminUpdateDomaine(token, id, domaine) {
  const res = await fetch(`${API_BASE}/api/admin/domaines/${id}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(domaine),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur modification domaine.');
  return data;
}

export async function adminDeleteDomaine(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/domaines/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur suppression domaine.');
  return data;
}

export async function adminToggleDomaine(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/domaines/${id}/toggle`, {
    method: 'PATCH',
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur activation/désactivation domaine.');
  return data;
}
