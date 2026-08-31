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
    throw new Error(errorData.error || 'Erreur lors de l’analyse de transférabilité');
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
    throw new Error(errorData.error || 'Erreur lors de la communication avec l’assistant');
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
    throw new Error(errorData.error || 'Erreur lors de l’analyse du profil');
  }
  return res.json();
}
