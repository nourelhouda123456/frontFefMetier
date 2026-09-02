// metierRef — app.js (Complete Rewrite)
(() => {
function initMetierRefApp() {
  if (window._metierRefInitialized) return;
  window._metierRefInitialized = true;
  // ─── State ─────────────────────────────────────────────────────────
  window.allMetiers   = [];
  window.allSkills    = [];
  window.comparedJobs = JSON.parse(localStorage.getItem('metierref_compared') || '[]');
  window.currentLang  = 'fr';

  let selectedDomain    = null;
  let activeSearchQuery = '';
  let activeSkillFilter = null;
  let visibleCount      = 12;
  let activeSourceFilter = 'rtmc'; // toujours RTMC uniquement
  let activeViewMode     = 'grid'; // 'grid', 'constellation'

  // ─── Helpers ───────────────────────────────────────────────────────
  const $  = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const esc = (v = '') => String(v).replace(/[&<>'"\u202f]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;','\u202f':' '}[c]));

  // ─── Relevance Scoring for Search & Autocomplete ─────────────────
  const getRelevanceScore = (metier, query) => {
    if (!query) return 0;
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (!q) return 0;

    const t = (metier.titre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const c = (metier.code || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const d = (metier.domaineGrand || metier.domaine || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    // 1. Titre exact
    if (t === q) return 10000;

    // 2. Le titre commence exactement par la requête (ex: "Développeur..." avec "de" ou "dev")
    if (t.startsWith(q)) return 8000;

    // 3. Un mot du titre commence par la requête (ex: "Ingénieur Développeur" avec "dev")
    const words = t.split(/[\s\-_'\/]+/);
    if (words.some(w => w.startsWith(q))) return 6000;

    // 4. Code métier commence par la requête (ex: "M1805" avec "M18")
    if (c.startsWith(q)) return 5000;

    // 5. Appellations / synonymes commencent par la requête
    const apps = (metier.appellations || []).map(a => (a || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    if (apps.some(a => a.startsWith(q))) return 4000;
    if (apps.some(a => a.split(/[\s\-_'\/]+/).some(w => w.startsWith(q)))) return 3000;

    // 6. Le titre contient la requête
    if (t.includes(q)) return 2000;

    // 7. Appellations contiennent la requête
    if (apps.some(a => a.includes(q))) return 1000;

    // 8. Domaine commence par ou contient la requête
    if (d.startsWith(q)) return 500;
    if (d.includes(q)) return 300;

    // 9. Définition contient la requête
    const def = (metier.definition || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (def.includes(q)) return 100;

    return 0;
  };

  // ─── Domain Emojis ─────────────────────────────────────────────────
  const EMOJIS = {
    'Agriculture et pêche': '🌾',
    "Artisanat et façonnage d'ouvrages d'art": '🏺',
    'Banque et assurance': '🏦',
    'Commerce, vente et grande distribution': '🛒',
    'Communication, média et multimédia': '📣',
    'Construction, bâtiment et travaux publiques': '🏗️',
    'Hôtellerie, restauration et tourisme': '🏨',
    'Industrie': '🏭',
    'Installation et maintenance': '🔧',
    'Santé': '🏥',
    'Service à la personne et à la société': '👥',
    'Arts et Spectacle': '🎨',
    "Support à l'entreprise": '📁',
    'Transport et logistique': '🚚',
    'Technologies de l\u2019Information et de la Communication-TIC': '💻'
  };

  // ─── i18n ──────────────────────────────────────────────────────────
  const T = {
    fr: {
      nav_home:'Accueil', nav_skills:'Compétences', nav_salary:'Niveaux et Rémunérations IA', nav_mobility:'Mobilité & Reconversion', nav_about:'À propos',
      btn_explore:'Explorer les métiers', btn_search:'Rechercher',
      btn_discover_skills:'Découvrir les compétences', btn_clear:'✕ Effacer les filtres',
      hero_badge:' Référentiel des Métiers et Compétences',
      hero_title:'Découvrez le métier qui vous correspond',
      hero_subtitle:'Explorez les métiers, les compétences et les passerelles de carrière au sein de notre référentiel officiel.',
      search_placeholder:'Rechercher un métier, une compétence, un code…',
      sectors_title:'Explorez par grand domaine', sectors_subtitle:'Cliquez sur un secteur pour filtrer les métiers.',
      jobs_title:'Découvrez les métiers', jobs_subtitle:'Répertoire officiel des fiches métiers et compétences.',
      jobs_count_suffix:' métiers disponibles',
      card_skills_count:'compétences', card_salary_est:'/ mois', card_salary_note:'*Estimation indicative',
      skills_title:'Les compétences au cœur de l\'orientation',
      skills_subtitle:'Cliquez sur une compétence pour filtrer les métiers associés.',
      demo_title:'Comprendre une fiche métier',
      demo_subtitle:'Structure des informations contenues dans chaque fiche du référentiel.',
      cta_footer_title:'Votre prochaine opportunité commence par une découverte',
      cta_footer_text:'Explorez les métiers et découvrez les compétences qui façonnent le monde professionnel.',
      footer_desc:'Plateforme d\'exploration et d\'orientation professionnelle. Consultez les fiches métiers, compétences et grilles salariales.',
      footer_sources:'À propos', footer_legal:'Données officielles des métiers, compétences clés et grilles de qualification.',
      toast_added:'Métier ajouté au comparateur.', toast_removed:'Métier retiré.',
      toast_max:'Maximum 3 métiers dans le comparateur.',
      btn_compare_label:'Comparer', btn_compare_remove:'Retirer',
      compare_modal_title:'Comparateur de Métiers',
      compare_empty_title:'Comparateur vide', compare_empty_text:'Sélectionnez des métiers à comparer.',
      tab_details:'Fiche Métier', tab_skills:'Compétences', tab_path:'Parcours d\'accès', tab_similar:'Métiers Similaires',
      load_more:'Charger plus de métiers', results_found:'métier(s) trouvé(s)',
      btn_details:'Plus de détails →'
    },
    en: {
      nav_home:'Home', nav_skills:'Skills', nav_salary:'Levels & Salaries AI', nav_mobility:'Mobility & Career Shift', nav_about:'About',
      btn_explore:'Explore Careers', btn_search:'Search',
      btn_discover_skills:'Discover Skills', btn_clear:'✕ Clear filters',
      hero_badge:'✅ Official Career & Skills Framework',
      hero_title:'Discover the career that matches you',
      hero_subtitle:'Explore careers, skills, and pathways across our official career framework.',
      search_placeholder:'Search for a career, skill, or code…',
      sectors_title:'Explore by Sector', sectors_subtitle:'Click a sector to filter careers.',
      jobs_title:'Discover Careers', jobs_subtitle:'Official career sheets and competency framework.',
      jobs_count_suffix:' careers available',
      card_skills_count:'skills', card_salary_est:'/ month', card_salary_note:'*Indicative estimate',
      skills_title:'Skills at the Heart of Orientation',
      skills_subtitle:'Click on a skill to filter associated careers.',
      demo_title:'Understanding a Career Sheet',
      demo_subtitle:'Information structure from each career sheet in the official framework.',
      cta_footer_title:'Your next opportunity begins with a discovery',
      cta_footer_text:'Explore careers and discover skills that shape the professional world.',
      footer_desc:'Career exploration and guidance platform. Browse career sheets, skills, and salary grids.',
      footer_sources:'About', footer_legal:'Official career data, key competencies and qualification grids.',
      toast_added:'Career added to comparison.', toast_removed:'Career removed.',
      toast_max:'Maximum 3 careers in comparator.',
      btn_compare_label:'Compare', btn_compare_remove:'Remove',
      compare_modal_title:'Career Comparator',
      compare_empty_title:'Comparator is empty', compare_empty_text:'Select careers to compare.',
      tab_details:'Career Info', tab_skills:'Skills', tab_path:'Access Path', tab_similar:'Similar Careers',
      load_more:'Load more careers', results_found:'career(s) found',
      btn_details:'More details →'
    }
  };

  // ─── Salary extraction ─────────────────────────────────────────────
  // Utilise les données réelles de l'API si disponibles, sinon fallback heuristique
  function getSalaryRange(metier) {
    // Si le métier a des données salariales de l'API, les utiliser
    if (metier && metier.salary && metier.salary.salaryMin && metier.salary.salaryMax) {
      return {
        min: metier.salary.salaryMin,
        max: metier.salary.salaryMax,
        avg: metier.salary.salaryAvg,
        source: 'api',
        metadata: metier.salary.metadata || null
      };
    }
    
    // Fallback : estimation heuristique basique (ancienne méthode)
    const code = metier?.code || '';
    const p = (code || '').charAt(0).toUpperCase();
    let range;
    if (p === 'I') range = { min: 1600, max: 2800 };
    else if (p === 'A') range = { min: 850,  max: 1350 };
    else if (p === 'B' || p === 'C') range = { min: 1300, max: 2200 };
    else if (p === 'H') range = { min: 1100, max: 1900 };
    else if (p === 'J') range = { min: 1200, max: 2100 };
    else if (p === 'M') range = { min: 1000, max: 1650 };
    else range = { min: 1100, max: 1700 };
    
    return { ...range, avg: Math.round((range.min + range.max) / 2), source: 'heuristic', metadata: null };
  }

  // ─── Compact SVG Radar ─────────────────────────────────────────────
  function compactRadar(item, size = 140, isLarge = false) {
    const cats = [
      { key: 'competencesTechniquesSavoirFaire', label: 'Savoir-faire', color: '#102646' },
      { key: 'competencesTechniquesSavoir',      label: 'Savoirs',      color: '#7c3aed' },
      { key: 'competencesComportementales',      label: 'Soft Skills',  color: '#059669' },
      { key: 'competencesNumeriques',            label: 'Numérique',    color: '#d97706' },
      { key: 'competencesLangues',               label: 'Langues',      color: '#db2777' },
    ];
    const counts = cats.map(c => (item[c.key] || []).length);
    const maxC   = Math.max(...counts, 1);
    const N      = cats.length;

    // Determine if we're rendering a "big" demo radar (size >= 240)
    const isBig  = size >= 240;
    const cx = size / 2, cy = size / 2;
    const maxR = isBig ? size * 0.30 : isLarge ? size * 0.32 : size * 0.30;

    // Build grid rings
    let rings = '';
    const strokeW = (isLarge || isBig) ? 1.5 : 1;
    [0.33, 0.66, 1].forEach((f, idx) => {
      const pts = cats.map((_, i) => {
        const a = (i / N) * 2 * Math.PI - Math.PI / 2;
        return `${cx + maxR * f * Math.cos(a)},${cy + maxR * f * Math.sin(a)}`;
      }).join(' ');
      const bgFill = idx === 2 ? '#f8fafc' : 'none';
      rings += `<polygon points="${pts}" fill="${bgFill}" stroke="#cbd5e1" stroke-width="${strokeW}"/>`;
    });

    // Build axes
    let axes = '';
    cats.forEach((_, i) => {
      const a = (i / N) * 2 * Math.PI - Math.PI / 2;
      axes += `<line x1="${cx}" y1="${cy}" x2="${cx + maxR * Math.cos(a)}" y2="${cy + maxR * Math.sin(a)}" stroke="#cbd5e1" stroke-width="${strokeW}" stroke-dasharray="2 2"/>`;
    });

    // Build data polygon
    const pts = counts.map((v, i) => {
      const r = (v / maxC) * maxR;
      const a = (i / N) * 2 * Math.PI - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

    // Labels: complete, untruncated category names with count
    let labels = '';
    const labelFontSize = isBig ? 13 : isLarge ? 12 : (size >= 160 ? 10 : 8.5);
    const labelOffset   = isBig ? 28 : isLarge ? 22 : (size >= 160 ? 16 : 13);
    cats.forEach((c, i) => {
      const a  = (i / N) * 2 * Math.PI - Math.PI / 2;
      const r  = maxR + labelOffset;
      const lx = cx + r * Math.cos(a);
      const ly = cy + r * Math.sin(a);
      const anchor = Math.cos(a) > 0.1 ? 'start' : Math.cos(a) < -0.1 ? 'end' : 'middle';
      
      let dy = '';
      if (anchor === 'middle') {
        dy = a < 0 ? 'dy="-4"' : 'dy="9"';
      } else {
        dy = 'dy="3"';
      }

      const count = counts[i];
      const txt = count > 0 ? `${c.label} (${count})` : c.label;
      labels += `<text x="${lx}" y="${ly}" ${dy} text-anchor="${anchor}" font-size="${labelFontSize}" font-weight="700" fill="${c.color}">${esc(txt)}</text>`;
    });

    // Dot points on polygon
    const dotR = (isLarge || isBig) ? 5 : 3.5;
    const dots = counts.map((v, i) => {
      const r = (v / maxC) * maxR;
      const a = (i / N) * 2 * Math.PI - Math.PI / 2;
      return `<circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="${dotR}" fill="${cats[i].color}" stroke="#fff" stroke-width="2"/>`;
    }).join('');

    const strokePolyW = (isLarge || isBig) ? 2.5 : 2;
    const className = isLarge ? 'large-radar-svg' : 'compact-radar-svg';
    return `<svg viewBox="0 0 ${size} ${size}" class="${className}" aria-hidden="true" overflow="visible">
      ${rings}${axes}
      <polygon points="${pts}" fill="rgba(16,38,70,0.22)" stroke="#102646" stroke-width="${strokePolyW}" stroke-linejoin="round"/>
      ${dots}
      ${labels}
    </svg>`;
  }

  // ─── Full Radar (drawer) ───────────────────────────────────────────
  function fullRadar(item, containerId) {
    const container = $('#' + containerId);
    if (!container) return;
    const size = 380;
    container.innerHTML = compactRadar(item, size, true);
  }

  // ─── Scroll to results ─────────────────────────────────────────────
  function scrollToResults() {
    const el = $('#results-section');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  // ─── Debounce ──────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  initLang();
  initHeader();
  initSearch();
  initComparator();
  initChat();
  loadData();

  // ─── Language ──────────────────────────────────────────────────────
  function initLang() {
    applyT();
  }

  function applyT() {
    const d = T[window.currentLang];
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (d[k] !== undefined) el.textContent = d[k];
    });
    const inp = $('#hero-search-input');
    if (inp && d.search_placeholder) inp.placeholder = d.search_placeholder;
  }

  // ─── Header scroll effect ──────────────────────────────────────────
  function initHeader() {
    const h = $('.header');
    if (!h) return;
    window.addEventListener('scroll', () => {
      h.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // ─── Data loading ──────────────────────────────────────────────────
  async function loadData() {
    showShimmer(true);
    try {
      const res = await fetch('/api/metiers');
      if (!res.ok) throw new Error('API error');
      window.allMetiers = await res.json();

      // Index skills
      const sk = new Set();
      window.allMetiers.forEach(m => {
        [...(m.competencesTechniquesSavoirFaire || []),
         ...(m.competencesTechniquesSavoir || []),
         ...(m.competencesComportementales || []),
         ...(m.competencesNumeriques || [])
        ].forEach(s => { if (s && s.trim().length > 2) sk.add(s.trim()); });
      });
      window.allSkills = Array.from(sk).sort((a, b) => a.localeCompare(b, 'fr'));

      if ($('#count-all')) $('#count-all').textContent = window.allMetiers.length.toLocaleString('fr-FR');
      // Mise à jour dynamique du KPI carte
      if ($('#kpi-total-jobs')) $('#kpi-total-jobs').textContent = window.allMetiers.length.toLocaleString('fr-FR');

      showShimmer(false);
      setupToolbarControls();
      setupMobilityMatrix();
      setupCareerSalarySimulator();
      renderSectorPills();
      renderGrid();
      renderSkills();
      renderDemo();
      updateCompareBar();
    } catch (e) {
      showShimmer(false);
      const g = $('#jobs-grid');
      if (g) g.innerHTML = '<div class="empty-state"><p>⚠ Erreur de chargement des données. Vérifiez que le serveur est démarré.</p></div>';
      console.error(e);
    }
  }

  function showShimmer(on) {
    const g = $('#jobs-grid');
    if (!g) return;
    if (on) {
      g.innerHTML = Array(8).fill('<div class="shimmer-card"></div>').join('');
    }
  }

  // ─── Sector Pills ──────────────────────────────────────────────────
  function renderSectorPills() {
    const wrap = $('#sector-pills');
    if (wrap) wrap.innerHTML = '';

    const domains = [...new Set(window.allMetiers.map(m => m.domaineGrand).filter(Boolean))].sort((a,b) => a.localeCompare(b,'fr'));

    const triggerWrap = $('#custom-domain-wrap');
    const trigger = $('#custom-domain-trigger');
    const triggerText = $('#custom-domain-text');
    const menu = $('#custom-domain-menu');
    
    if (menu && trigger && triggerText) {
      menu.innerHTML = '';
      
      const allDiv = document.createElement('div');
      allDiv.className = 'domain-menu-item active';
      allDiv.textContent = 'Tous les domaines';
      allDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDomain = null;
        triggerText.textContent = 'Tous les domaines';
        updateFilterAndRender(allDiv);
      });
      menu.appendChild(allDiv);

      domains.forEach(domain => {
        const count = window.allMetiers.filter(m => m.domaineGrand === domain).length;
        const div = document.createElement('div');
        div.className = 'domain-menu-item';
        div.textContent = `${domain} (${count})`;
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedDomain = domain;
          triggerText.textContent = domain;
          updateFilterAndRender(div);
        });
        menu.appendChild(div);
      });

      function updateFilterAndRender(activeItem) {
        menu.classList.remove('open');
        if (triggerWrap) triggerWrap.classList.remove('open');
        $$('.domain-menu-item').forEach(el => el.classList.remove('active'));
        if (activeItem) activeItem.classList.add('active');

        activeSearchQuery = '';
        activeSkillFilter = null;
        if ($('#hero-search-input')) $('#hero-search-input').value = '';
        $$('.skill-pill').forEach(p => p.classList.remove('active'));
        visibleCount = 12;
        renderGrid();
        scrollToResults();
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close search suggestions when opening domain menu (mutual exclusion)
        const sugg = $('#search-suggestions');
        if (sugg) { sugg.classList.remove('open'); sugg.style.display = 'none'; }
        const isOpen = menu.classList.toggle('open');
        if (triggerWrap) triggerWrap.classList.toggle('open', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
          menu.classList.remove('open');
          if (triggerWrap) triggerWrap.classList.remove('open');
        }
      });
    }

    domains.forEach(domain => {
      const count = window.allMetiers.filter(m => m.domaineGrand === domain).length;
      const pill  = document.createElement('button');
      pill.className = 'sector-pill';
      pill.innerHTML = `${EMOJIS[domain] || '💼'} ${esc(domain)} <span class="pill-count">${count}</span>`;

      pill.addEventListener('click', () => {
        const isActive = pill.classList.contains('active');
        $$('.sector-pill').forEach(p => p.classList.remove('active'));
        $$('.skill-pill').forEach(p => p.classList.remove('active'));
        selectedDomain    = isActive ? null : domain;
        activeSearchQuery = '';
        activeSkillFilter = null;
        $('#hero-search-input').value = '';
        visibleCount = 12;
        if (!isActive) pill.classList.add('active');
        renderGrid();
        scrollToResults();
      });

      if (wrap) wrap.appendChild(pill);
    });
  }

  // ─── Jobs Grid ─────────────────────────────────────────────────────
  function renderGrid() {
    const grid       = $('#jobs-grid');
    const countEl    = $('#results-count');
    const clearBtn   = $('#btn-clear-filters');
    const loadMoreBtn = $('#btn-load-more');
    if (!grid) return;

    const d = T[window.currentLang];

    // Filter by Source (RTMC uniquement)
    let list = window.allMetiers.filter(m => m.source === 'rtmc' || !m.source);

    if (selectedDomain)    list = list.filter(m => m.domaineGrand === selectedDomain);
    if (activeSkillFilter) {
      const target = activeSkillFilter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
      list = list.filter(m => [
        ...(m.competencesTechniquesSavoirFaire || []),
        ...(m.competencesTechniquesSavoir || []),
        ...(m.competencesComportementales || []),
        ...(m.competencesNumeriques || [])
      ].some(s => s && s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(target)));
    }

    if (activeSearchQuery) {
      list = list.map(m => ({ metier: m, score: getRelevanceScore(m, activeSearchQuery) }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.metier.titre || '').length - (b.metier.titre || '').length;
        })
        .map(item => item.metier);
    }

    // Count bar
    if (countEl) countEl.textContent = `${list.length.toLocaleString('fr-FR')} ${d.results_found || d.jobs_count_suffix}`;
    if (clearBtn) clearBtn.style.display = (selectedDomain || activeSearchQuery || activeSkillFilter) ? 'inline-flex' : 'none';

    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>Aucun métier ne correspond à vos critères.</p></div>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    grid.innerHTML = '';
    const slice = list.slice(0, visibleCount);

    slice.forEach((item, idx) => {
      const isEsco = item.source === 'esco' || (item.code && item.code.startsWith('ESCO')) || (item.url && item.url.includes('esco'));
      const badgeText = isEsco ? '📋 Fiche' : '📋 Fiche';
      const badgeClass = isEsco ? 'chat-badge-rtmc' : 'chat-badge-rtmc';

      const sal = getSalaryRange(item);
      const totalSkills = (item.competencesTechniquesSavoirFaire||item.essentialSkills||[]).length
        + (item.competencesTechniquesSavoir||item.optionalSkills||[]).length
        + (item.competencesComportementales||[]).length
        + (item.competencesNumeriques||[]).length;

      const desc = (item.resume || item.definition || '').slice(0, 115);

      const card = document.createElement('div');
      card.className = 'job-card';
      card.style.animationDelay = `${(idx % 12) * 35}ms`;

      card.innerHTML = `
        <div class="job-card-stripe"></div>
        <div class="job-card-body">
          <div class="job-card-meta-top">
            <span class="job-card-code">${esc(item.code)}</span>
            <span class="chat-source-origin ${badgeClass}">${badgeText}</span>
          </div>
          <h3 class="job-card-title">${esc(item.titre)}</h3>
          <p class="job-card-desc">${esc(desc)}${desc.length >= 115 ? '…' : ''}</p>

          <div class="job-card-radar">
            <span class="radar-title">Profil de compétences</span>
            ${compactRadar(item)}
          </div>

          <div class="job-card-chips">
            <span class="chip chip-skills">⚡ ${totalSkills} ${d.card_skills_count}</span>
            <span class="chip chip-salary">${`💰 ${sal.min}–${sal.max} / mois`}</span>
          </div>

          <div class="job-card-actions">
            <button class="btn-card-detail" data-key="${esc(item._id || item.url || '')}">${d.btn_details}</button>
            <button class="btn-card-compare" data-key="${esc(item._id || item.url || '')}" title="${d.btn_compare_label}">⚖</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-card-detail').addEventListener('click', () => openDrawer(item._id || item.url));
      const cb = card.querySelector('.btn-card-compare');
      const itemKey = String(item._id || item.url || '');
      if (window.comparedJobs.includes(itemKey)) cb.classList.add('active');
      cb.addEventListener('click', e => { e.stopPropagation(); toggleCompare(itemKey, cb); });

      grid.appendChild(card);
    });

    // Load more
    if (loadMoreBtn) {
      if (list.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent   = d.load_more;
        loadMoreBtn.onclick = () => { visibleCount += 12; renderGrid(); };
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  }

  // ─── Skills cloud ──────────────────────────────────────────────────
  function renderSkills() {
    const cloud = $('#skills-cloud');
    if (!cloud) return;
    cloud.innerHTML = '';

    // Extract all real skills from dataset with frequency
    const skillCounts = new Map();
    (window.allMetiers || []).forEach(m => {
      const seenInJob = new Set();
      [
        ...(m.competencesTechniquesSavoirFaire || []),
        ...(m.competencesTechniquesSavoir || []),
        ...(m.competencesComportementales || []),
        ...(m.competencesNumeriques || [])
      ].forEach(s => {
        const trimmed = s && s.trim();
        if (trimmed && trimmed.length >= 3 && trimmed.length <= 42) {
          const key = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          const normKey = key.toLowerCase();
          if (!seenInJob.has(normKey)) {
            seenInJob.add(normKey);
            skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
          }
        }
      });
    });

    // Select top 22 most popular real skills
    const topSkills = Array.from(skillCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 22);

    topSkills.forEach(([skill, count]) => {
      const btn = document.createElement('button');
      const isActive = activeSkillFilter && activeSkillFilter.toLowerCase() === skill.toLowerCase();
      btn.className = 'skill-pill' + (isActive ? ' active' : '');
      btn.innerHTML = `<span class="sp-icon">⚡</span><span class="sp-text">${esc(skill)}</span><span class="sp-count">${count}</span>`;
      btn.addEventListener('click', () => {
        if (activeSkillFilter && activeSkillFilter.toLowerCase() === skill.toLowerCase()) {
          activeSkillFilter = null;
          $('#hero-search-input').value = '';
        } else {
          activeSkillFilter = skill;
          selectedDomain    = null;
          activeSearchQuery = '';
          $('#hero-search-input').value = skill;
          $$('.sector-pill').forEach(p => p.classList.remove('active'));
        }
        $$('.skill-pill').forEach(p => p.classList.toggle('active', p === btn && activeSkillFilter !== null));
        visibleCount = 12;
        renderGrid();
        scrollToResults();
      });
      cloud.appendChild(btn);
    });
  }

  // ─── Demo section ──────────────────────────────────────────────────
  function renderDemo() {
    const box = $('#demo-sheet-box');
    if (!box || !window.allMetiers.length) return;

    const job = window.allMetiers.find(m => m.code === 'I1401') || window.allMetiers[0];
    if (!job) return;
    const sal = getSalaryRange(job);

    const sfChips = (job.competencesTechniquesSavoirFaire||[]).slice(0,4)
      .map(s => `<span class="skill-chip sf">${esc(s)}</span>`).join('');
    const svChips = (job.competencesTechniquesSavoir||[]).slice(0,3)
      .map(s => `<span class="skill-chip sv">${esc(s)}</span>`).join('');
    const ssChips = (job.competencesComportementales||[]).slice(0,3)
      .map(s => `<span class="skill-chip ss">${esc(s)}</span>`).join('');
    const snChips = (job.competencesNumeriques||[]).slice(0,2)
      .map(s => `<span class="skill-chip sn">${esc(s)}</span>`).join('');

    box.innerHTML = `
      <div class="demo-card">

        <!-- Header: full-width title block -->
        <div class="demo-top-header">
          <div class="demo-top-meta">
            <span class="job-card-code">${esc(job.code)}</span>
            <span class="demo-sector-badge">${esc(job.domaineGrand)}</span>
          </div>
          <h2 class="demo-title">${esc(job.titre)}</h2>
          <p class="demo-desc">${esc((job.definition || job.resume || '').slice(0, 200))}…</p>
        </div>

        <!-- Center section: radar + skills side by side -->
        <div class="demo-center-layout">

          <!-- Left: big radar -->
          <div class="demo-radar-panel">
            <div class="demo-radar-label">📊 Profil de compétences</div>
            <div class="demo-radar-svg-wrap">
              ${compactRadar(job, 320)}
            </div>
          </div>

          <!-- Right: skills grouped -->
          <div class="demo-skills-panel">
            ${sfChips ? `<div class="demo-skill-group">
              <div class="demo-skill-group-title" style="color:#102646;border-color:#e5e5e5">⚡ Savoir-faire techniques</div>
              <div class="demo-chips-wrap">${sfChips}</div>
            </div>` : ''}
            ${svChips ? `<div class="demo-skill-group">
              <div class="demo-skill-group-title" style="color:#7c3aed;border-color:#c4b5fd">📚 Savoirs</div>
              <div class="demo-chips-wrap">${svChips}</div>
            </div>` : ''}
            ${ssChips ? `<div class="demo-skill-group">
              <div class="demo-skill-group-title" style="color:#065f46;border-color:#6ee7b7">🤝 Soft Skills</div>
              <div class="demo-chips-wrap">${ssChips}</div>
            </div>` : ''}
            ${snChips ? `<div class="demo-skill-group">
              <div class="demo-skill-group-title" style="color:#92400e;border-color:#fcd34d">💻 Numérique</div>
              <div class="demo-chips-wrap">${snChips}</div>
            </div>` : ''}
          </div>

        </div>

        <!-- Footer: salary + button -->
        <div class="demo-footer-bar">
          <div class="drawer-salary-block" style="flex:1;max-width:380px">
            <span class="drawer-salary-icon">💰</span>
            <div>
              <div class="drawer-salary-val">${sal.min} – ${sal.max} TND / mois</div>
              <div class="drawer-salary-note">*Basé sur données INS 2022</div>
            </div>
          </div>
          <button class="btn-primary" id="btn-demo-details">Voir la fiche complète →</button>
        </div>

      </div>
    `;

    $('#btn-demo-details').addEventListener('click', () => openDrawer(job._id || job.url));
  }

  // ─── Search autocomplete ───────────────────────────────────────────
  function initSearch() {
    const input = $('#hero-search-input');
    const drop  = $('#search-suggestions');
    const form  = $('#hero-search-form');
    const clearBtn = $('#btn-clear-filters');
    if (!input || !drop || !form) return;

    // Close domain dropdown when focusing on search input (mutual exclusion)
    input.addEventListener('focus', () => {
      const domainMenu = $('#custom-domain-menu');
      const domainWrap = $('#custom-domain-wrap');
      if (domainMenu) domainMenu.classList.remove('open');
      if (domainWrap) domainWrap.classList.remove('open');
    });

    input.addEventListener('input', debounce(() => {
      // Close domain dropdown when typing (mutual exclusion)
      const domainMenu = $('#custom-domain-menu');
      const domainWrap = $('#custom-domain-wrap');
      if (domainMenu) domainMenu.classList.remove('open');
      if (domainWrap) domainWrap.classList.remove('open');

      const val = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      drop.innerHTML = '';
      if (val.length < 2) { drop.classList.remove('open'); return; }

      let jobs = window.allMetiers.map(m => ({ metier: m, score: getRelevanceScore(m, val) }))
        .filter(item => {
          if (item.score <= 0) return false;
          if (activeSourceFilter === 'rtmc') return item.metier.source === 'rtmc' || !item.metier.source;
          if (activeSourceFilter === 'esco') return item.metier.source === 'esco';
          return true;
        });

      jobs.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.metier.titre || '').length - (b.metier.titre || '').length;
      });

      const topJobs = jobs.slice(0, 6).map(item => item.metier);

      const skills = window.allSkills.filter(s =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(val)
      ).sort((a, b) => {
        const na = a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const nb = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const aStart = na.startsWith(val);
        const bStart = nb.startsWith(val);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return na.localeCompare(nb);
      }).slice(0, 3);

      if (!topJobs.length && !skills.length) { drop.classList.remove('open'); return; }

      if (topJobs.length) {
        const label = document.createElement('div');
        label.className = 'sugg-label';
        label.textContent = '💼 Métiers';
        drop.appendChild(label);
      }

      topJobs.forEach(m => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<span class="s-icon">💼</span><div><strong>${esc(m.titre)}</strong><small>${esc(m.domaineGrand)} · ${esc(m.code)}</small></div>`;
        div.addEventListener('click', () => {
          input.value = m.titre;
          drop.classList.remove('open');
          openDrawer(m._id || m.url);
        });
        drop.appendChild(div);
      });

      if (skills.length) {
        const label = document.createElement('div');
        label.className = 'sugg-label';
        label.textContent = '⚡ Compétences';
        drop.appendChild(label);
      }

      skills.forEach(s => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<span class="s-icon">⚡</span><div><strong>${esc(s)}</strong><small>Filtrer par compétence</small></div>`;
        div.addEventListener('click', () => {
          input.value       = s;
          activeSkillFilter = s;
          selectedDomain    = null;
          activeSearchQuery = '';
          drop.classList.remove('open');
          $$('.sector-pill').forEach(p => p.classList.remove('active'));
          visibleCount = 12;
          renderGrid();
          scrollToResults();
        });
        drop.appendChild(div);
      });

      drop.style.display = '';
      drop.classList.add('open');
    }, 160));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = input.value.trim();
      // Close BOTH dropdowns on search submit
      drop.classList.remove('open');
      drop.style.display = 'none';
      const domainMenu = $('#custom-domain-menu');
      const domainWrap = $('#custom-domain-wrap');
      if (domainMenu) domainMenu.classList.remove('open');
      if (domainWrap) domainWrap.classList.remove('open');
      activeSearchQuery = val;
      selectedDomain    = null;
      activeSkillFilter = null;
      $$('.sector-pill').forEach(p => p.classList.remove('active'));
      $$('.skill-pill').forEach(p => p.classList.remove('active'));
      visibleCount = 12;
      renderGrid();
      scrollToResults();
    });

    document.addEventListener('click', e => {
      if (!drop.contains(e.target) && e.target !== input) drop.classList.remove('open');
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeSearchQuery = '';
        selectedDomain    = null;
        activeSkillFilter = null;
        input.value       = '';
        $$('.sector-pill').forEach(p => p.classList.remove('active'));
        if ($('#domain-select')) $('#domain-select').value = '';
        $$('.skill-pill').forEach(p => p.classList.remove('active'));
        visibleCount = 12;
        renderGrid();
      });
    }
  }

  // ─── Drawer ────────────────────────────────────────────────────────
  async function openDrawer(key) {
    const overlay = $('#job-drawer');
    const content = $('#drawer-content');
    if (!overlay || !content) return;

    // Chercher par _id (priorité) puis par url
    const metier = window.allMetiers.find(m =>
      (m._id && String(m._id) === String(key)) ||
      (m.url && m.url === key)
    );
    if (!metier) { showToast('Fiche introuvable.', 'error'); return; }
    window._currentDrawerMetier = metier; // Store for PDF export

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    content.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px;padding:8px 0">
      ${Array(4).fill('<div class="shimmer-card" style="height:60px;border-radius:12px"></div>').join('')}
    </div>`;

    setTimeout(() => {
      const isEsco = metier.source === 'esco' || (metier.uri && metier.uri.includes('esco')) || (metier.code && metier.code.startsWith('ESCO'));
      const d   = T[window.currentLang];
      const totalSkills = (metier.competencesTechniquesSavoirFaire||[]).length
        + (metier.competencesTechniquesSavoir||[]).length
        + (metier.competencesComportementales||[]).length
        + (metier.competencesNumeriques||[]).length;

      // Base salary calculation
      let baseMin = 1000, baseMax = 1800;
      const currency = isEsco ? 'EUR' : 'TND';
      const period = isEsco ? 'an' : 'mois';

      if (!isEsco) {
        if (metier.salary && metier.salary.salaryMin && metier.salary.salaryMax) {
          baseMin = metier.salary.salaryMin; baseMax = metier.salary.salaryMax;
        } else {
          const c0 = (metier.code || '').charAt(0).toUpperCase();
          if (c0 === 'M') { baseMin = 1400; baseMax = 2500; }
          else if (c0 === 'I') { baseMin = 1300; baseMax = 2200; }
          else if (c0 === 'J') { baseMin = 1200; baseMax = 2100; }
          else if (c0 === 'A') { baseMin = 750;  baseMax = 1200; }
          else { baseMin = 950; baseMax = 1650; }
        }
      } else {
        baseMin = 32000; baseMax = 48000;
      }

      const levelsDef = [
        { id: 'debutant', label: '🌱 Débutant', exp: '0-1 an', mult: 0.80, bonus: 'Palier d\'entrée (0-1 an)' },
        { id: 'junior',   label: '⚡ Junior',   exp: '1-3 ans', mult: 1.00, bonus: '+25% vs Débutant' },
        { id: 'confirme', label: '⭐ Confirmé', exp: '3-5 ans', mult: 1.35, bonus: '+35% vs Junior' },
        { id: 'senior',   label: '🚀 Senior',   exp: '5-8 ans', mult: 1.80, bonus: '+80% vs Junior' },
        { id: 'expert',   label: '👑 Expert',   exp: '8+ ans',  mult: 2.40, bonus: '+140% vs Junior' }
      ];

      const initialLvl = levelsDef[1]; // Junior default
      const initialMin = Math.round(baseMin * initialLvl.mult);
      const initialMax = Math.round(baseMax * initialLvl.mult);

      const sfList = metier.competencesTechniquesSavoirFaire || [];
      const svList = metier.competencesTechniquesSavoir || [];
      const ssList = metier.competencesComportementales || [];
      const snList = metier.competencesNumeriques || [];

      content.innerHTML = `
        <div class="formal-doc-wrapper">

          <!-- 2-Column Split Executive Layout at the Top (SECTIONS 1 & 2 DIRECTEMENT VISIBLES) -->
          <div class="formal-doc-top-layout">
            
            <!-- Left Column: Identity, Section 01 Description & Salary -->
            <div class="formal-doc-left-col">
              
              <!-- Identity Header Card -->
              <div class="formal-doc-header">
                <div class="formal-doc-meta">
                  <span class="formal-doc-badge">📋 FICHE MÉTIER</span>
                  <span class="formal-doc-code">CODE : <strong>${esc(metier.code)}</strong></span>
                </div>

                <h1 class="formal-doc-title">${esc(metier.titre)}</h1>

                <div class="formal-doc-domain">
                  <span class="domain-icon">📁</span>
                  <span><strong>Domaine Grand :</strong> ${esc(metier.domaineGrand)}</span>
                  ${metier.domaineProfessionnel ? `<span class="sep">›</span><span><strong>Domaine Pro :</strong> ${esc(metier.domaineProfessionnel)}</span>` : ''}
                </div>

                <div class="formal-doc-actions">
                  <button class="btn-formal-outline btn-pdf-download" onclick="window._downloadPDF(event)" data-url="${esc(metier.url)}" data-titre="${esc(metier.titre)}">📥 Télécharger PDF</button>
                  <button class="btn-formal-primary btn-drawer-compare" data-key="${esc(metier._id || metier.code || metier.url || '')}">⚖ ${d.btn_compare_label}</button>
                </div>
              </div>

              <!-- Section 01: Description générale & Appellations (DIRECTEMENT VISIBLE) -->
              <div class="formal-section">
                <div class="formal-section-header">
                  <span class="f-sec-num">01</span>
                  <h3>Description générale &amp; Appellations</h3>
                </div>
                <div class="formal-section-body">
                  <p class="formal-text-lead">${esc(metier.definition || metier.resume || 'Aucune description spécifique fournie dans le référentiel.')}</p>

                  ${metier.appellations && metier.appellations.length ? `
                    <div class="formal-subsection">
                      <h4 class="formal-sub-title">Appellations &amp; Intitulés associés</h4>
                      <div class="formal-tags-list">
                        ${metier.appellations.map(a => `<span class="formal-tag-item">${esc(a)}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Salary Estimates card (DIRECTEMENT VISIBLE) -->
              <div class="formal-metric-card" style="margin-bottom: 24px;">
                <span class="f-metric-label">Estimation Salariale par Expérience</span>
                <div class="f-metric-val" id="drawer-salary-display">
                  ${initialMin.toLocaleString()} – ${initialMax.toLocaleString()} ${currency} / ${period}
                </div>
                <div class="f-metric-sub" id="drawer-salary-note">
                  Niveau : <strong>Junior</strong> (1-3 ans) · ${initialLvl.bonus}
                </div>
                
                <div class="formal-level-selector" id="drawer-level-nav">
                  ${levelsDef.map(l => `
                    <button type="button" class="f-level-btn ${l.id === 'junior' ? 'active' : ''}" data-level="${l.id}" data-min="${Math.round(baseMin * l.mult)}" data-max="${Math.round(baseMax * l.mult)}" data-bonus="${l.bonus}" data-exp="${l.exp}" data-label="${l.label}">
                      ${l.label}
                    </button>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- Right Column: Section 02 Profil Radar (DIRECTEMENT VISIBLE) -->
            <div class="formal-doc-right-col">
              <div class="formal-radar-sticky-card">
                <div class="formal-radar-sticky-header">
                  <span class="f-sec-num">02</span>
                  <h3>Profil Radar des Compétences</h3>
                </div>
                
                <div class="formal-radar-wrapper-inner">
                  <div id="drawer-radar"></div>
                </div>

                <div class="formal-radar-legend-box">
                  <div class="f-metric-label">Synthèse des Compétences</div>
                  <div class="f-metric-val" style="color:#102646; font-size:18px; margin-bottom: 8px;">${totalSkills} Compétences Clés</div>
                  <div class="radar-legend-items">
                    <span class="radar-legend-dot sf">Savoir-faire: ${sfList.length}</span>
                    <span class="radar-legend-dot sv">Savoirs: ${svList.length}</span>
                    <span class="radar-legend-dot ss">Soft Skills: ${ssList.length}</span>
                    ${snList.length ? `<span class="radar-legend-dot sn">Numérique: ${snList.length}</span>` : ''}
                  </div>
                </div>
              </div>
            </div>

          </div> <!-- End of formal-doc-top-layout -->

          <!-- ══════════════════════════════════════════════════════════
               SECTIONS ÉPURÉES SANS SOUS-DESCRIPTION (VOIR DÉTAILS UNIQUEMENT)
               ══════════════════════════════════════════════════════════ -->

          <!-- Section 03: Référentiel des Compétences (Matrice Institutionnelle) -->
          <div class="formal-section formal-accordion-section" id="sec-03-accordion">
            <div class="formal-section-header-compact">
              <div class="f-sec-title-wrap">
                <span class="f-sec-num">03</span>
                <h3>Référentiel détaillé des compétences</h3>
              </div>
              <button type="button" class="btn-toggle-details" aria-expanded="false">
                <span class="toggle-btn-text">Voir détails</span>
                <span class="toggle-details-chevron">▼</span>
              </button>
            </div>

            <!-- Détails déroulants : Matrice Formelle et Structurée -->
            <div class="formal-details-dropdown">
              <div class="formal-skills-matrix">
                
                ${sfList.length ? `
                  <div class="formal-matrix-block sf">
                    <div class="matrix-block-header">
                      <div class="matrix-title-row">
                        <span class="matrix-icon">⚡</span>
                        <h4>Savoir-faire techniques &amp; opérationnels</h4>
                      </div>
                      <span class="matrix-badge">${sfList.length} compétences</span>
                    </div>
                    <div class="matrix-block-body">
                      <ul class="matrix-list">
                        ${sfList.map((s, idx) => `
                          <li class="matrix-list-item">
                            <span class="matrix-item-index">${String(idx + 1).padStart(2, '0')}</span>
                            <span class="matrix-item-text">${esc(s)}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                ` : ''}

                ${svList.length ? `
                  <div class="formal-matrix-block sv">
                    <div class="matrix-block-header">
                      <div class="matrix-title-row">
                        <span class="matrix-icon">📘</span>
                        <h4>Connaissances théoriques &amp; Savoirs associés</h4>
                      </div>
                      <span class="matrix-badge">${svList.length} connaissances</span>
                    </div>
                    <div class="matrix-block-body">
                      <ul class="matrix-list">
                        ${svList.map((s, idx) => `
                          <li class="matrix-list-item">
                            <span class="matrix-item-index">${String(idx + 1).padStart(2, '0')}</span>
                            <span class="matrix-item-text">${esc(s)}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                ` : ''}

                ${ssList.length ? `
                  <div class="formal-matrix-block ss">
                    <div class="matrix-block-header">
                      <div class="matrix-title-row">
                        <span class="matrix-icon">🤝</span>
                        <h4>Compétences comportementales (Soft Skills)</h4>
                      </div>
                      <span class="matrix-badge">${ssList.length} aptitudes</span>
                    </div>
                    <div class="matrix-block-body">
                      <ul class="matrix-list">
                        ${ssList.map((s, idx) => `
                          <li class="matrix-list-item">
                            <span class="matrix-item-index">${String(idx + 1).padStart(2, '0')}</span>
                            <span class="matrix-item-text">${esc(s)}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                ` : ''}

                ${snList.length ? `
                  <div class="formal-matrix-block sn">
                    <div class="matrix-block-header">
                      <div class="matrix-title-row">
                        <span class="matrix-icon">💻</span>
                        <h4>Compétences numériques &amp; Outils</h4>
                      </div>
                      <span class="matrix-badge">${snList.length} compétences</span>
                    </div>
                    <div class="matrix-block-body">
                      <ul class="matrix-list">
                        ${snList.map((s, idx) => `
                          <li class="matrix-list-item">
                            <span class="matrix-item-index">${String(idx + 1).padStart(2, '0')}</span>
                            <span class="matrix-item-text">${esc(s)}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                ` : ''}

              </div>
            </div>
          </div>

          <!-- Section 04: Environnement & Conditions -->
          <div class="formal-section formal-accordion-section" id="sec-04-accordion">
            <div class="formal-section-header-compact">
              <div class="f-sec-title-wrap">
                <span class="f-sec-num">04</span>
                <h3>Environnement &amp; Conditions d'exercice</h3>
              </div>
              <button type="button" class="btn-toggle-details" aria-expanded="false">
                <span class="toggle-btn-text">Voir détails</span>
                <span class="toggle-details-chevron">▼</span>
              </button>
            </div>

            <!-- Détails déroulants -->
            <div class="formal-details-dropdown" style="padding:0;">
              <table class="formal-spec-table">
                <tbody>
                  <tr>
                    <th scope="row">Structures d'exercice</th>
                    <td>${(metier.environnementStructures||[]).join(' • ') || 'Non spécifié dans le référentiel.'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Secteurs d'activité</th>
                    <td>${(metier.environnementSecteurs||[]).join(' • ') || 'Non spécifié dans le référentiel.'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Conditions &amp; Contraintes</th>
                    <td>${(metier.environnementConditions||[]).join(' • ') || 'Non spécifié dans le référentiel.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 05: Accès à l'emploi -->
          <div class="formal-section formal-accordion-section" id="sec-05-accordion">
            <div class="formal-section-header-compact">
              <div class="f-sec-title-wrap">
                <span class="f-sec-num">05</span>
                <h3>Conditions d'accès à l'emploi &amp; Diplômes</h3>
              </div>
              <button type="button" class="btn-toggle-details" aria-expanded="false">
                <span class="toggle-btn-text">Voir détails</span>
                <span class="toggle-details-chevron">▼</span>
              </button>
            </div>

            <!-- Détails déroulants -->
            <div class="formal-details-dropdown">
              <div class="formal-callout-box">
                <p style="margin:0;">${esc(metier.accesEmploi || 'L\'accès à cet emploi est soumis aux règles de qualification, de diplôme ou d\'expérience exigées par le référentiel officiel.')}</p>
              </div>
            </div>
          </div>

          <!-- Section 06: Mobilités & Passerelles -->
          <div class="formal-section formal-accordion-section" id="sec-06-accordion">
            <div class="formal-section-header-compact">
              <div class="f-sec-title-wrap">
                <span class="f-sec-num">06</span>
                <h3>Mobilités &amp; Métiers similaires</h3>
              </div>
              <button type="button" class="btn-toggle-details" aria-expanded="false">
                <span class="toggle-btn-text">Voir détails</span>
                <span class="toggle-details-chevron">▼</span>
              </button>
            </div>

            <!-- Détails déroulants -->
            <div class="formal-details-dropdown">
              <div class="similar-jobs-list" id="similar-list"><p style="color:var(--text-muted);font-size:14px">Chargement des équivalences…</p></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="formal-doc-footer">
            <span>Document officiel — metierRef</span>
            <span>Édition 2026</span>
          </div>

        </div>
      `;

      // Render radar chart
      fullRadar(metier, 'drawer-radar');

      // Seniority level pill switching in formal mode
      const salDisplay = content.querySelector('#drawer-salary-display');
      const salNote    = content.querySelector('#drawer-salary-note');
      content.querySelectorAll('.f-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          content.querySelectorAll('.f-level-btn').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const min = Number(btn.dataset.min).toLocaleString();
          const max = Number(btn.dataset.max).toLocaleString();
          if (salDisplay) salDisplay.textContent = `${min} – ${max} ${currency} / ${period}`;
          if (salNote) salNote.innerHTML = `Niveau : <strong>${btn.dataset.label.replace(/^[^\s]+\s*/, '')}</strong> (${btn.dataset.exp}) · ${btn.dataset.bonus}`;
        });
      });

      // Compare button
      const cmpBtn = content.querySelector('.btn-drawer-compare');
      if (cmpBtn) {
        if (window.comparedJobs.includes(String(metier._id || metier.url || ''))) cmpBtn.textContent = `⚖ ${T[window.currentLang].btn_compare_remove}`;
        cmpBtn.addEventListener('click', () => toggleCompare(String(metier._id || metier.url || ''), cmpBtn));
      }

      // Load similar
      loadSimilar(metier._id || metier.code || metier.url);

      // Accordion Toggle 'Voir détails' / 'Masquer détails'
      content.querySelectorAll('.formal-accordion-section').forEach(section => {
        const header = section.querySelector('.formal-section-header-compact');
        const btn = section.querySelector('.btn-toggle-details');
        const btnText = section.querySelector('.toggle-btn-text');
        
        function toggleSection(e) {
          if (e) e.stopPropagation();
          const isOpen = section.classList.toggle('open');
          if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (btnText) btnText.textContent = isOpen ? 'Masquer détails' : 'Voir détails';
        }

        if (header) header.addEventListener('click', toggleSection);
        if (btn) btn.addEventListener('click', toggleSection);
      });

    }, 120);

    // Close
    $('#drawer-close').onclick = closeDrawer;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDrawer(); });
  }

  function closeDrawer() {
    $('#job-drawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  async function loadSimilar(url) {
    const list = $('#similar-list');
    if (!list) return;
    try {
      const res = await fetch(`/api/metiers/similar?url=${encodeURIComponent(url)}&limit=5`);
      const data = await res.json();
      if (!data || !data.length) { list.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Aucun résultat.</p>'; return; }
      list.innerHTML = data.map(s => `
        <div class="similar-job-item" data-url="${esc(s.url)}">
          <div>
            <div class="sji-title">${esc(s.titre)}</div>
            <div class="sji-domain">${esc(s.code)} · ${esc(s.pertinence)}% similaire</div>
          </div>
          <span class="sji-arrow">→</span>
        </div>
      `).join('');
      list.querySelectorAll('.similar-job-item').forEach(el => {
        el.addEventListener('click', () => openDrawer(el.dataset.url));
      });
    } catch {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Erreur de chargement.</p>';
    }
  }

  // ─── Comparator ────────────────────────────────────────────────────
  function initComparator() {
    const closeModal = $('#btn-close-compare-modal');
    if (closeModal) closeModal.onclick = () => { $('#compare-modal').classList.remove('open'); document.body.style.overflow = ''; };

    const viewBtn = $('#btn-view-compare');
    if (viewBtn) viewBtn.onclick = () => { renderCompare(); $('#compare-modal').classList.add('open'); document.body.style.overflow = 'hidden'; };

    const clearBtn = $('#btn-clear-compare');
    if (clearBtn) clearBtn.onclick = () => {
      window.comparedJobs = [];
      localStorage.setItem('metierref_compared', '[]');
      updateCompareBar();
      $$('.btn-card-compare').forEach(b => b.classList.remove('active'));
    };
  }

  function toggleCompare(url, btn) {
    const d = T[window.currentLang];
    const has = window.comparedJobs.includes(url);
    if (has) {
      window.comparedJobs = window.comparedJobs.filter(u => u !== url);
      showToast(d.toast_removed);
    } else {
      if (window.comparedJobs.length >= 3) { showToast(d.toast_max, 'warning'); return; }
      window.comparedJobs.push(url);
      showToast(d.toast_added);
    }
    localStorage.setItem('metierref_compared', JSON.stringify(window.comparedJobs));
    updateCompareBar();
    // Sync all compare buttons for this url
    $$(`.btn-card-compare[data-key="${url}"]`).forEach(b => b.classList.toggle('active', !has));
    if (btn) {
      btn.classList.toggle('active', !has);
      if (btn.classList.contains('btn-drawer-compare')) {
        btn.textContent = !has ? `⚖ ${d.btn_compare_remove}` : `⚖ ${d.btn_compare_label}`;
      }
    }
    if ($('#compare-modal').classList.contains('open')) renderCompare();
  }

  function updateCompareBar() {
    const bar = $('#compare-bar');
    const cnt = $('#compare-bar-count');
    if (!bar) return;
    const n = window.comparedJobs.length;
    bar.style.display = n > 0 ? 'flex' : 'none';
    if (cnt) cnt.textContent = `${n} métier(s) sélectionné(s)`;
  }

  function renderCompare() {
    const c = $('#comparison-content');
    if (!c) return;
    const d = T[window.currentLang];
    const selected = window.comparedJobs.map(key => window.allMetiers.find(m =>
      (m._id && String(m._id) === String(key)) || (m.url && m.url === key)
    )).filter(Boolean);

    if (!selected.length) {
      c.innerHTML = `
        <div class="compare-empty-state">
          <div class="compare-empty-icon">⚖️</div>
          <h3>${d.compare_empty_title}</h3>
          <p>${d.compare_empty_text}</p>
        </div>`;
      return;
    }

    c.innerHTML = `
      <div class="compare-grid">
        ${selected.map(m => {
          const sal = getSalaryRange(m);
          const totalSkills = (m.competencesTechniquesSavoirFaire||[]).length
            + (m.competencesTechniquesSavoir||[]).length
            + (m.competencesComportementales||[]).length
            + (m.competencesNumeriques||[]).length;

          return `
            <div class="compare-col">
              <div class="compare-col-header">
                <div class="compare-header-top">
                  <span class="drawer-code-badge">${esc(m.code)}</span>
                  <button class="btn-remove-cmp" data-key="${esc(m._id || m.id || m.code || m.url || '')}" title="Retirer de la comparaison" aria-label="Retirer">✕</button>
                </div>
                <h3 class="compare-job-title">${esc(m.titre)}</h3>
                <div class="compare-domain">
                  <span class="cd-icon">🏢</span>
                  <span>${esc(m.domaineGrand)} ${m.domaineProfessionnel ? '› ' + esc(m.domaineProfessionnel) : ''}</span>
                </div>
              </div>

              <!-- Salary highlight -->
              <div class="compare-salary-badge">
                <span class="cs-icon">💰</span>
                <div>
                  <div class="cs-val">${sal.min} – ${sal.max} TND / mois</div>
                  <div class="cs-note">*Estimation INS 2022 · ${totalSkills} compétences</div>
                </div>
              </div>

              <!-- Mini Radar Chart -->
              <div class="compare-radar-wrap">
                ${compactRadar(m, 180)}
              </div>

              <!-- Details sections -->
              <div class="compare-section">
                <div class="compare-sec-title sec-path">🎓 Accès &amp; Formation</div>
                <div class="compare-sec-box">${esc(m.accesEmploi || 'Non spécifié dans le référentiel.')}</div>
              </div>

              <div class="compare-section">
                <div class="compare-sec-title sec-sf">⚡ Savoir-faire clés (Top 5)</div>
                <div class="compare-skills-list">
                  ${(m.competencesTechniquesSavoirFaire || []).length ?
                    (m.competencesTechniquesSavoirFaire || []).slice(0, 5).map(s => `<span class="skill-chip sf">${esc(s)}</span>`).join('')
                    : '<span class="compare-empty-note">Aucun savoir-faire renseigné</span>'
                  }
                </div>
              </div>

              ${(m.competencesTechniquesSavoir || []).length ? `
              <div class="compare-section">
                <div class="compare-sec-title sec-sv">📘 Connaissances théoriques</div>
                <div class="compare-skills-list">
                  ${(m.competencesTechniquesSavoir || []).slice(0, 3).map(s => `<span class="skill-chip sv">${esc(s)}</span>`).join('')}
                </div>
              </div>` : ''}

              <div class="compare-section">
                <div class="compare-sec-title sec-ss">🤝 Soft Skills</div>
                <div class="compare-skills-list">
                  ${(m.competencesComportementales || []).length ?
                    (m.competencesComportementales || []).slice(0, 4).map(s => `<span class="skill-chip ss">${esc(s)}</span>`).join('')
                    : '<span class="compare-empty-note">Aucune compétence comportementale renseignée</span>'
                  }
                </div>
              </div>

              ${(m.competencesNumeriques || []).length ? `
              <div class="compare-section">
                <div class="compare-sec-title sec-sn">💻 Compétences numériques</div>
                <div class="compare-skills-list">
                  ${(m.competencesNumeriques || []).slice(0, 3).map(s => `<span class="skill-chip sn">${esc(s)}</span>`).join('')}
                </div>
              </div>` : ''}

              <div class="compare-col-footer">
                <button class="btn-primary btn-open-drawer-cmp" data-key="${esc(m._id || m.id || m.code || m.url || '')}">
                  Voir la fiche complète →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    c.querySelectorAll('.btn-open-drawer-cmp').forEach(b => b.addEventListener('click', () => {
      $('#compare-modal').classList.remove('open');
      document.body.style.overflow = '';
      openDrawer(b.dataset.url);
    }));
    c.querySelectorAll('.btn-remove-cmp').forEach(b => b.addEventListener('click', () => {
      toggleCompare(b.dataset.url);
    }));
  }

  // ─── Chat Widget ───────────────────────────────────────────────────
  function initChat() {
    const fab = $('#chat-widget-trigger');
    const win = $('#chat-widget-window');
    const closeBtn = $('#chat-widget-close');
    const form = $('#chat-widget-form');
    const input = $('#chat-widget-input');
    if (!fab || !win) return;

    // Simple UI (no CV tab)
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <span class="chat-header-icon">🤖</span>
          <div>
            <div class="chat-header-title">Assistant IA Métiers</div>
            <div class="chat-header-sub" id="chat-mode-badge">Mode: Lexical</div>
          </div>
        </div>
        <button id="chat-widget-close" class="chat-close-btn" aria-label="Fermer">✕</button>
      </div>

      <div class="chat-messages" id="chat-widget-messages">
        <div class="chat-msg assistant">
          <div class="chat-bubble">
            👋 Bonjour ! Posez-moi une question sur les métiers, les compétences, les formations…<br><br>
          </div>
        </div>
      </div>

      <form class="chat-input-row" id="chat-widget-form">
        <input type="text" id="chat-widget-input" placeholder="Ex: Quels métiers utilisent Python ?" autocomplete="off">
        <button type="submit" class="chat-send-btn" title="Envoyer">↑</button>
      </form>
    `;

    // Re-query elements after rebuild
    const closeBtn2 = $('#chat-widget-close');
    const qForm = $('#chat-widget-form');
    const qInput = $('#chat-widget-input');
    const modeBadge = $('#chat-mode-badge');

    fab.onclick = () => { win.classList.toggle('open'); if (win.classList.contains('open')) qInput?.focus(); };
    closeBtn2.onclick = () => win.classList.remove('open');

    // Question submit
    qForm.onsubmit = async e => {
      e.preventDefault();
      const q = qInput.value.trim();
      if (!q) return;
      chatAddBubble('user', q);
      qInput.value = '';
      const tid = chatAddTyping();
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q })
        });
        const data = await res.json();
        chatRemove(tid);
        chatAddBubble('assistant', data.answer || 'Désolé, aucune réponse trouvée.');
        if (data.sources && data.sources.length) chatAddSources(data.sources);
        if (modeBadge) modeBadge.textContent = `Mode: ${data.mode === 'semantic' ? '🧠 Sémantique' : '🔤 Lexical'}`;
      } catch {
        chatRemove(tid);
        chatAddBubble('error', '⚠️ Erreur de connexion au serveur.');
      }
    };
  }


  let chatN = 0;
  function chatAddBubble(type, html) {
    const msgs = $('#chat-widget-messages');
    if (!msgs) return;
    const id  = 'cb' + chatN++;
    const div = document.createElement('div');
    div.id    = id;
    div.className = `chat-msg ${type === 'user' ? 'user' : type === 'error' ? 'assistant error' : 'assistant'}`;
    div.innerHTML = `<div class="chat-bubble">${type === 'user' ? esc(html) : html}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  }

  function chatAddTyping() {
    const msgs = $('#chat-widget-messages');
    if (!msgs) return;
    const id  = 'cb' + chatN++;
    const div = document.createElement('div');
    div.id    = id;
    div.className = 'chat-msg assistant';
    div.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  }

  function chatRemove(id) {
    document.getElementById(id)?.remove();
  }

  function chatAddSources(sources) {
    const msgs = $('#chat-widget-messages');
    if (!msgs || !sources.length) return;
    const id  = 'cb' + chatN++;
    const div = document.createElement('div');
    div.id    = id;
    div.className = 'chat-msg assistant';
    const cards = sources.map(s => {
      const isEsco = s.source === 'esco' || (s.code && s.code.startsWith('ESCO')) || (s.url && s.url.includes('esco'));
      const badgeText = isEsco ? '📋 Fiche' : '📋 Fiche';
      const badgeClass = isEsco ? 'chat-badge-rtmc' : 'chat-badge-rtmc';
      return `
      <div class="chat-source-card" data-key="${esc(s._id || s.id || s.code || s.url || '')}">
        <div class="chat-source-header">
          <span class="chat-source-code">${esc(s.code || '')}</span>
          <span class="chat-source-origin ${badgeClass}">${badgeText}</span>
        </div>
        <div class="chat-source-title">${esc(s.titre || '')}</div>
        <div class="chat-source-meta">
          <span class="chat-source-domain">${esc(s.domaine || '')}</span>
          ${s.pertinence != null ? `<span class="chat-source-score">${s.pertinence}%</span>` : ''}
        </div>
      </div>
      `;
    }).join('');
    div.innerHTML = `<div class="chat-sources-wrap">${cards}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;

    // Click to open drawer
    div.querySelectorAll('.chat-source-card[data-url]').forEach(card => {
      if (card.dataset.url) {
        card.style.cursor = 'pointer';
        card.onclick = () => {
          $('#chat-widget-window')?.classList.remove('open');
          openDrawer(card.dataset.url);
        };
      }
    });
  }

  // ─── Source Filter Tabs Controls (désactivé — RTMC uniquement) ───
  function setupToolbarControls() {
    // Les onglets source ont été supprimés, rien à faire
  }


  // ─── Mobility & Transferability Matrix Logic ────────────────────────
  let selectedSourceJob = null;
  let selectedTargetJob = null;

  function setupMobilityMatrix() {
    const inputSource = $('#mobility-input-source');
    const suggSource  = $('#mobility-sugg-source');
    const inputTarget = $('#mobility-input-target');
    const suggTarget  = $('#mobility-sugg-target');
    const btnAnalyze  = $('#btn-analyze-mobility');

    if (!inputSource || !inputTarget || !btnAnalyze) return;

    function setupAutocomplete(inputEl, suggEl, onSelect) {
      inputEl.oninput = debounce(() => {
        const q = inputEl.value.trim();
        if (q.length < 1) { suggEl.style.display = 'none'; return; }
        const matches = (window.allMetiers || [])
          .map(m => ({ metier: m, score: getRelevanceScore(m, q) }))
          .filter(item => item.score > 0)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.metier.titre || '').length - (b.metier.titre || '').length;
          })
          .slice(0, 8)
          .map(item => item.metier);

        if (!matches.length) { suggEl.style.display = 'none'; return; }

        const header = `<div class="mobility-sugg-header">${matches.length} résultat${matches.length > 1 ? 's' : ''} correspondant${matches.length > 1 ? 's' : ''}</div>`;
        const items = matches.map(m => {
          const isEsco = m.source === 'esco';
          const badgeClass = isEsco ? 'rtmc' : 'rtmc';
          const badgeLabel = isEsco ? 'Officiel' : 'Officiel';
          return `
            <div class="mobility-sugg-item" data-key="${esc(m._id || m.id || m.code || m.url || ' ')}" data-titre="${esc(m.titre || '')}">
              <div class="mobility-sugg-item-left">
                <span class="mobility-sugg-title">${esc(m.titre)}</span>
                <span class="mobility-sugg-code">Code : ${esc(m.code || '—')} &nbsp;·&nbsp; ${esc(m.domaineGrand || m.domaine || '')}</span>
              </div>
              <span class="mobility-sugg-badge ${badgeClass}">${badgeLabel}</span>
            </div>`;
        }).join('');
        suggEl.innerHTML = header + items;
        suggEl.style.display = 'block';
        suggEl.style.overflowY = 'auto';

        suggEl.querySelectorAll('.mobility-sugg-item').forEach(item => {
          item.onclick = () => {
            const k = item.dataset.key;
            const found = (window.allMetiers || []).find(m =>
              (m._id && String(m._id) === k) ||
              (m.id && String(m.id) === k) ||
              (m.code && String(m.code) === k) ||
              (m.url && m.url === k) ||
              (m.titre && m.titre === item.dataset.titre)
            );
            if (found) {
              inputEl.value = `${found.titre} (${found.code || ''})`;
              onSelect(found);
            }
            suggEl.style.display = 'none';
          };
        });
      }, 120);

      document.addEventListener('click', e => {
        if (!inputEl.contains(e.target) && !suggEl.contains(e.target)) {
          suggEl.style.display = 'none';
        }
      });
    }

    setupAutocomplete(inputSource, suggSource, m => selectedSourceJob = m);
    setupAutocomplete(inputTarget, suggTarget, m => selectedTargetJob = m);

    btnAnalyze.onclick = async () => {
      if (!selectedSourceJob || !selectedTargetJob) {
        showToast('Veuillez sélectionner le Métier Source (A) et le Métier Cible (B)', 'warning');
        return;
      }

      btnAnalyze.disabled = true;
      btnAnalyze.textContent = '⏳ Analyse en cours...';

      try {
        const btnAnalyzeContent = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Analyser la passerelle
        `;
        btnAnalyze.disabled = true;
        btnAnalyze.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></span> Analyse en cours...';

        const res = await fetch('/api/transferability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceUrl: selectedSourceJob.url || selectedSourceJob.code,
            targetUrl: selectedTargetJob.url || selectedTargetJob.code
          })
        });

        const data = await res.json();
        btnAnalyze.disabled = false;
        btnAnalyze.innerHTML = btnAnalyzeContent;

        if (data.error) throw new Error(data.error);

        // Mark step 3 done
        const step3 = document.getElementById('mobility-step-result');
        if (step3) step3.classList.add('active', 'done');

        renderMobilityResults(data);
      } catch (err) {
        btnAnalyze.disabled = false;
        btnAnalyze.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Analyser la passerelle
        `;
        showToast(err.message || 'Erreur lors de l\'analyse.', 'warning');
      }
    };

    // Reset button
    const btnReset = document.getElementById('btn-reset-mobility');
    if (btnReset) {
      btnReset.onclick = () => {
        selectedSourceJob = null;
        selectedTargetJob = null;
        if (inputSource) inputSource.value = '';
        if (inputTarget) inputTarget.value = '';
        const out = document.getElementById('mobility-results-output');
        if (out) { out.style.display = 'none'; out.innerHTML = ''; }
        const s3 = document.getElementById('mobility-step-result');
        if (s3) s3.classList.remove('active', 'done');
        showToast('Formulaire réinitialisé.');
      };
    }
  }

  function renderMobilityResults(data) {
    const output = $('#mobility-results-output');
    if (!output) return;

    const scoreDeg = Math.round((data.matchPercentage / 100) * 360);
    const isSourceEsco = data.sourceJob.source === 'esco';
    const isTargetEsco = data.targetJob.source === 'esco';

    output.innerHTML = `
      <div class="mobility-summary-card">
        <div class="mobility-gauge-box">
          <div class="mobility-score-circle" style="--score-deg: ${scoreDeg}">
            <span class="mobility-score-val">${data.matchPercentage}%</span>
          </div>
          <span class="mobility-gauge-label">Indice de Transférabilité</span>
        </div>

        <div class="mobility-info-cols">
          <h3 class="mobility-job-title">
            Passerelle professionnelle : <span style="color:var(--primary)">${esc(data.sourceJob.titre)}</span> ➔ <span style="color:#059669">${esc(data.targetJob.titre)}</span>
          </h3>
          <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-muted)">
            <span>Source : <strong>${esc(data.sourceJob.titre)}</strong></span>
            <span>➔</span>
            <span>Cible : <strong>${esc(data.targetJob.titre)}</strong></span>
          </div>
          <div class="mobility-badge-effort ${data.effortClass}">
            Indice d'effort d'adaptation : <strong>${esc(data.effort)}</strong>
          </div>
        </div>
      </div>

      <div class="mobility-skills-grid">
        <div class="mobility-skills-col">
          <div class="mobility-skills-head acquired">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Compétences Transférables &amp; Socles Communs (${data.acquiredSkills.length})</span>
          </div>
          ${data.acquiredSkills.length ? data.acquiredSkills.map(s => `
            <div class="mobility-skill-item acquired">
              <span>${esc(s)}</span>
            </div>
          `).join('') : '<p style="font-size:13px;color:var(--text-muted)">Aucune compétence directe commune identifiée dans les descriptifs officiels.</p>'}
        </div>

        <div class="mobility-skills-col">
          <div class="mobility-skills-head missing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Compétences Complémentaires à Développer (${data.missingSkills.length})</span>
          </div>
          ${data.missingSkills.length ? data.missingSkills.map(s => `
            <div class="mobility-skill-item missing">
              <span>${esc(s)}</span>
            </div>
          `).join('') : '<p style="font-size:13px;color:#16a34a;font-weight:600">Adéquation complète : l\'ensemble des compétences requises sont déjà acquises.</p>'}
        </div>
      </div>
    `;

    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ─── Career Seniority & Salary Simulator Logic ──────────────────────
  let selectedCareerJob = null;
  let selectedCareerLevel = 'junior';

  function setupCareerSalarySimulator() {
    const inputJob    = $('#career-salary-input');
    const suggBox     = $('#career-salary-sugg');
    const levelBtns   = $$('#career-level-selector .career-level-btn');
    const btnSimulate = $('#btn-career-simulate');
    const btnReset    = $('#btn-career-reset');

    if (!inputJob || !btnSimulate) return;

    const defaultBtnHtml = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Générer l'évaluation salariale`;

    // Autocomplete for Job search
    inputJob.oninput = debounce(() => {
      const q = inputJob.value.trim();
      if (q.length < 1) { suggBox.style.display = 'none'; return; }
      
      const matches = (window.allMetiers || [])
        .map(m => ({ metier: m, score: getRelevanceScore(m, q) }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.metier.titre || '').length - (b.metier.titre || '').length;
        })
        .slice(0, 8)
        .map(item => item.metier);

      if (!matches.length) { suggBox.style.display = 'none'; return; }

      suggBox.innerHTML = `
        <div class="mobility-sugg-header">${matches.length} résultat${matches.length > 1 ? 's' : ''} correspondant${matches.length > 1 ? 's' : ''}</div>
        ${matches.map(m => {
          const isEsco = m.source === 'esco';
          return `
            <div class="career-sugg-item" data-key="${esc(m._id || m.id || m.code || m.url || ' ')}" data-titre="${esc(m.titre || '')}">
              <div class="mobility-sugg-item-left">
                <span class="mobility-sugg-title">${esc(m.titre)}</span>
                <span class="mobility-sugg-code">Code : ${esc(m.code || '—')} &nbsp;·&nbsp; ${esc(m.domaineGrand || '')}</span>
              </div>
              <span class="mobility-sugg-badge ${isEsco ? 'rtmc' : 'rtmc'}">${isEsco ? 'Officiel' : 'Officiel'}</span>
            </div>`;
        }).join('')}
      `;

      suggBox.style.display = 'block';

      suggBox.querySelectorAll('.career-sugg-item').forEach(item => {
        item.onclick = () => {
          const k = item.dataset.key;
          const found = (window.allMetiers || []).find(m =>
            (m._id && String(m._id) === k) ||
            (m.id && String(m.id) === k) ||
            (m.code && String(m.code) === k) ||
            (m.url && m.url === k) ||
            (m.titre && m.titre === item.dataset.titre)
          );
          if (found) {
            inputJob.value = `${found.titre} (${found.code || ''})`;
            selectedCareerJob = found;
          }
          suggBox.style.display = 'none';
        };
      });
    }, 120);

    document.addEventListener('click', e => {
      if (!inputJob.contains(e.target) && !suggBox.contains(e.target)) {
        suggBox.style.display = 'none';
      }
    });

    // Level buttons selection
    levelBtns.forEach(btn => {
      btn.onclick = () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCareerLevel = btn.dataset.level || 'junior';

        // Auto re-simulate if already rendered
        const output = $('#career-results-output');
        if (output && output.style.display === 'block' && selectedCareerJob) {
          triggerCareerSimulation();
        }
      };
    });

    // Simulate action
    async function triggerCareerSimulation() {
      if (!selectedCareerJob) {
        showToast('Veuillez sélectionner un métier dans la liste.', 'warning');
        return;
      }

      btnSimulate.disabled = true;
      btnSimulate.innerHTML = 'Calcul prévisionnel en cours...';

      try {
        const res = await fetch('/api/career-salary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobUrl: selectedCareerJob.url || selectedCareerJob.code,
            level: selectedCareerLevel
          })
        });

        const data = await res.json();
        btnSimulate.disabled = false;
        btnSimulate.innerHTML = defaultBtnHtml;

        if (data.error) throw new Error(data.error);

        renderCareerSalaryResults(data);
      } catch (err) {
        btnSimulate.disabled = false;
        btnSimulate.innerHTML = defaultBtnHtml;
        showToast(err.message || 'Erreur lors du calcul salarial.', 'warning');
      }
    }

    btnSimulate.onclick = triggerCareerSimulation;

    // Reset action
    if (btnReset) {
      btnReset.onclick = () => {
        selectedCareerJob = null;
        selectedCareerLevel = 'junior';
        inputJob.value = '';
        levelBtns.forEach(b => b.classList.toggle('active', b.dataset.level === 'junior'));
        const output = $('#career-results-output');
        if (output) { output.style.display = 'none'; output.innerHTML = ''; }
        showToast('Formulaire réinitialisé.');
      };
    }
  }

  function renderCareerSalaryResults(data) {
    const output = $('#career-results-output');
    if (!output) return;

    const curLvl = data.selectedLevel;
    const isEsco = data.isEsco;
    const currency = data.currency;
    const period = data.period;

    // Find max avg salary among levels for percentage chart bars
    const maxVal = Math.max(...data.levelList.map(l => l.salaryAvg), 1);

    output.innerHTML = `
      <!-- KPI Top Grid -->
      <div class="career-kpi-grid">
        <div class="career-kpi-card highlight">
          <span class="career-kpi-label">Fourchette Estimée (${esc(curLvl.label)})</span>
          <span class="career-kpi-value">${curLvl.salaryMin.toLocaleString()} – ${curLvl.salaryMax.toLocaleString()} ${currency}</span>
          <span class="career-kpi-sub">Moyenne indicative : ~${curLvl.salaryAvg.toLocaleString()} ${currency} / ${period}</span>
        </div>

        <div class="career-kpi-card">
          <span class="career-kpi-label">Palier & Qualification</span>
          <span class="career-kpi-value" style="font-size:20px;color:#0f172a">${esc(curLvl.label)}</span>
          <span class="career-kpi-sub">Ancienneté requise : <strong>${curLvl.experience}</strong></span>
        </div>

        <div class="career-kpi-card">
          <span class="career-kpi-label">Progression Salariale</span>
          <span class="career-kpi-value" style="font-size:20px;color:var(--primary)">${esc(curLvl.growthBonus)}</span>
          <span class="career-kpi-sub">Par rapport au niveau d'entrée</span>
        </div>
      </div>

      <!-- Progression Bar Chart (5 levels) -->
      <div class="career-progression-chart-box">
        <div class="career-chart-title">
          <span>Comparatif des 5 paliers d'expérience pour <strong>${esc(data.job.titre)}</strong></span>
          <span style="font-size:12px;color:var(--text-muted);font-weight:500">Unité : ${currency} / ${period}</span>
        </div>
        <div class="career-bars-grid">
          ${data.levelList.map(l => {
            const pct = Math.max(15, Math.round((l.salaryAvg / maxVal) * 100));
            const isSelected = l.id === curLvl.id;
            const tierCode = l.id === 'debutant' ? 'N1' : l.id === 'junior' ? 'N2' : l.id === 'confirme' ? 'N3' : l.id === 'senior' ? 'N4' : 'N5';
            return `
              <div class="career-bar-row ${isSelected ? 'active' : ''}">
                <div class="career-bar-label">
                  <span class="bar-tier-tag">${tierCode}</span>
                  <span>${esc(l.label)}</span>
                </div>
                <div class="career-bar-track">
                  <div class="career-bar-fill" style="width: ${pct}%;"></div>
                </div>
                <div class="career-bar-val">
                  ${l.salaryAvg.toLocaleString()} ${currency}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Split Columns: Skills & Responsibilities -->
      <div class="career-split-grid">
        <div class="career-col-card">
          <div class="career-col-title">
            Compétences Attendues (${esc(curLvl.label)})
          </div>
          <div class="career-skill-chips">
            ${curLvl.prioritySkills && curLvl.prioritySkills.length ? curLvl.prioritySkills.map(s => `
              <span class="career-chip">${esc(s)}</span>
            `).join('') : '<p style="font-size:13px;color:var(--text-muted)">Compétences socles du référentiel.</p>'}
          </div>
          <div style="margin-top:auto;padding-top:10px;font-size:12.5px;color:var(--primary);font-weight:600">
            Objectif échelon supérieur : ${esc(curLvl.nextLevelTarget)}
          </div>
        </div>

        <div class="career-col-card">
          <div class="career-col-title">
            Missions & Périmètre d'Activité (${esc(curLvl.label)})
          </div>
          <p style="font-size:13.5px;color:#334155;line-height:1.55">${esc(curLvl.role)}</p>
          <p style="font-size:13px;color:var(--text-muted);line-height:1.55;margin-top:6px"><strong>Responsabilités :</strong> ${esc(curLvl.responsibilities)}</p>
        </div>
      </div>

      <!-- AI Career Advisor Card -->
      <div class="career-ai-advice-box">
        <div class="career-ai-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="career-ai-content">
          <div class="career-ai-title">Recommandations & Perspectives RH</div>
          <div class="career-ai-text">
            ${(data.aiTips || []).map(tip => `<p style="margin-bottom:4px">• ${esc(tip)}</p>`).join('')}
          </div>
          <button type="button" class="btn-career-ask-ai" id="btn-career-ask-chat">
            Consulter le conseiller pour ce profil
          </button>
        </div>
      </div>
    `;

    output.style.display = 'block';
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Handle AI chat prompt trigger
    const chatBtn = output.querySelector('#btn-career-ask-chat');
    if (chatBtn) {
      chatBtn.onclick = () => {
        const chatWin = $('#chat-widget-window');
        const chatInp = $('#chat-widget-input');
        if (chatWin) chatWin.classList.add('open');
        if (chatInp) {
          chatInp.value = `Comment puis-je évoluer du niveau ${curLvl.label} au niveau supérieur pour le métier ${data.job.titre} ?`;
          chatInp.focus();
        }
      };
    }
  }

  // ─── Toast ─────────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${type==='warning'?'#92400e':'#065f46'};color:#fff;padding:10px 20px;border-radius:9999px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.2);white-space:nowrap;transition:opacity .4s`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2800);
  }

  // ─── Debounce ──────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // ─── MENU MOBILE HAMBURGER ──────────────────────────────────────
  function initMobileMenu() {
    const menuBtn = $('#mobile-menu-btn');
    const menuOverlay = $('#mobile-menu-overlay');
    const mobileLinks = $$('.mobile-nav-link');

    if (!menuBtn || !menuOverlay) return;

    // Toggle menu
    menuBtn.onclick = () => {
      menuBtn.classList.toggle('active');
      menuOverlay.classList.toggle('open');
      document.body.style.overflow = menuOverlay.classList.contains('open') ? 'hidden' : '';
    };

    // Fermer le menu quand on clique sur un lien
    mobileLinks.forEach(link => {
      link.onclick = () => {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      };
    });

    // Fermer le menu en cliquant sur l'overlay
    menuOverlay.onclick = (e) => {
      if (e.target === menuOverlay) {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

    // ─── Initialisation ────────────────────────────────────────────────
    initMobileMenu();

  } // end initMetierRefApp

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMetierRefApp);
  } else {
    initMetierRefApp();
  }
  window.initMetierRefApp = initMetierRefApp;
})();

// ─── PDF Download — Document institutionnel formel ────────────────────────────
window._downloadPDF = function(e) {
  var btn = e.currentTarget;
  var metier = window._currentDrawerMetier;
  if (!metier) {
    var titreAttr = btn.getAttribute('data-titre') || '';
    metier = (window.allMetiers || []).find(function(m) { return m.titre === titreAttr; });
  }
  if (!metier) { alert('Fiche non disponible. Rouvrez la fiche metier.'); return; }

  var titre = (metier.titre || 'Fiche_Metier').replace(/[<>:"/\\|?*]/g, '').trim();
  var filename = titre.replace(/\s+/g, '_') + '.pdf';
  var originalHTML = btn.innerHTML;
  btn.innerHTML = '⏳ Génération...';
  btn.disabled = true;

  function esc(s) {
    return (s || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPDFHTML(m) {
    var sfList = m.competencesTechniquesSavoirFaire || [];
    var svList = m.competencesTechniquesSavoir || [];
    var ssList = m.competencesComportementales || [];
    var snList = m.competencesNumeriques || [];
    var totalSkills = sfList.length + svList.length + ssList.length + snList.length;

    var baseMin = 950, baseMax = 1650;
    if (m.salary && m.salary.salaryMin) {
      baseMin = m.salary.salaryMin;
      baseMax = m.salary.salaryMax;
    } else {
      var c0 = (m.code || '').charAt(0).toUpperCase();
      if (c0 === 'M') { baseMin = 1400; baseMax = 2500; }
      else if (c0 === 'I') { baseMin = 1300; baseMax = 2200; }
      else if (c0 === 'J') { baseMin = 1200; baseMax = 2100; }
      else if (c0 === 'A') { baseMin = 750;  baseMax = 1200; }
    }

    var today = new Date();
    var dateStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    var refNum = 'REF-' + (m.code || '000') + '-2026';

    var css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: "Times New Roman", Times, serif; background: #fff; color: #1a1a1a; width: 794px; font-size: 13px; line-height: 1.5; }
      h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; }
      .page { width: 794px; padding: 0; }
      .doc-header { background: #0f223d; color: #fff; padding: 0; }
      .doc-header-top { display: flex; align-items: stretch; border-bottom: 3px solid #EF7408; }
      .doc-header-logo { background: #EF7408; width: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18px 10px; flex-shrink: 0; }
      .doc-header-logo .logo-text { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; color: #fff; text-align: center; text-transform: uppercase; letter-spacing: .5px; margin-top: 6px; }
      .doc-header-logo .logo-symbol { font-size: 28px; color: #fff; line-height: 1; }
      .doc-header-main { flex: 1; padding: 20px 24px; }
      .doc-header-type { font-size: 9px; font-weight: 700; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
      .doc-header-title { font-size: 22px; font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 8px; font-family: Arial, sans-serif; }
      .doc-header-meta { display: flex; gap: 20px; flex-wrap: wrap; }
      .doc-header-meta span { font-size: 10px; color: rgba(255,255,255,.75); display: flex; align-items: center; gap: 4px; }
      .doc-header-meta strong { color: #EF7408; }
      .doc-header-ref { background: rgba(0,0,0,.3); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
      .doc-header-ref span { font-size: 10px; color: rgba(255,255,255,.65); font-family: Arial, sans-serif; letter-spacing: .5px; }
      .doc-header-ref .ref-badge { background: #EF7408; color: #fff; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 3px; letter-spacing: 1px; }
      .stats-strip { display: flex; border-bottom: 2px solid #e8eaf0; }
      .stat-box { flex: 1; text-align: center; padding: 14px 8px; border-right: 1px solid #e8eaf0; }
      .stat-box:last-child { border-right: none; }
      .stat-num { font-size: 22px; font-weight: 900; color: #0f223d; font-family: Arial, sans-serif; line-height: 1; }
      .stat-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .8px; color: #888; margin-top: 3px; font-family: Arial, sans-serif; }
      .doc-body { padding: 28px 36px; }
      .section { margin-bottom: 26px; page-break-inside: avoid; }
      .section-header { display: flex; align-items: center; gap: 0; margin-bottom: 14px; }
      .section-num { background: #0f223d; color: #fff; font-size: 9px; font-weight: 700; font-family: Arial, sans-serif; padding: 5px 10px; letter-spacing: 1px; }
      .section-title { flex: 1; background: #f4f6f8; border-top: 2px solid #0f223d; border-bottom: 1px solid #d0d5e0; padding: 6px 14px; font-size: 12px; font-weight: 700; color: #0f223d; text-transform: uppercase; letter-spacing: .8px; font-family: Arial, sans-serif; }
      .section-title-accent { background: #EF7408; color: #fff; font-size: 9px; font-weight: 700; font-family: Arial, sans-serif; padding: 6px 12px; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; border-top: 2px solid #EF7408; }
      .desc-text { font-size: 12.5px; line-height: 1.75; color: #2d2d2d; text-align: justify; margin-bottom: 14px; }
      .appellation-grid { display: flex; flex-wrap: wrap; gap: 5px; }
      .appellation-item { border: 1px solid #c8cfd8; color: #333; padding: 3px 10px; font-size: 11px; font-family: Arial, sans-serif; }
      .salary-table { width: 100%; border-collapse: collapse; border: 1px solid #c8cfd8; }
      .salary-table th { background: #0f223d; color: #fff; font-size: 10px; padding: 8px 10px; text-align: center; font-family: Arial, sans-serif; letter-spacing: .5px; border: 1px solid #1a3a6e; }
      .salary-table td { padding: 8px 10px; text-align: center; font-size: 11px; border: 1px solid #d5dae3; font-family: Arial, sans-serif; }
      .salary-table tr:nth-child(even) td { background: #f7f9fc; }
      .salary-table .sal-range { font-weight: 700; color: #0f223d; font-size: 12px; }
      .salary-table .sal-highlight td { background: #fff8f0 !important; }
      .competence-block { margin-bottom: 18px; border: 1px solid #d0d5e0; }
      .competence-block-header { background: #0f223d; color: #fff; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; }
      .competence-block-header h4 { font-size: 11px; font-weight: 700; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: .8px; margin: 0; }
      .competence-block-header .count-badge { background: #EF7408; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 8px; font-family: Arial, sans-serif; }
      .competence-block.sf .competence-block-header { background: #0f223d; }
      .competence-block.sv .competence-block-header { background: #1a4a7a; }
      .competence-block.ss .competence-block-header { background: #2a3a5a; }
      .competence-block.sn .competence-block-header { background: #0a3050; }
      .competence-grid { display: grid; grid-template-columns: 1fr 1fr; }
      .competence-item { display: flex; align-items: flex-start; gap: 8px; padding: 7px 12px; border-bottom: 1px solid #eef0f4; border-right: 1px solid #eef0f4; font-size: 11.5px; font-family: Arial, sans-serif; line-height: 1.4; }
      .competence-item:nth-child(2n) { border-right: none; }
      .competence-num { color: #0f223d; font-weight: 700; font-size: 10px; min-width: 22px; margin-top: 1px; opacity: .7; }
      .spec-table { width: 100%; border-collapse: collapse; border: 1px solid #c8cfd8; }
      .spec-table th { background: #f4f6f8; color: #0f223d; font-size: 11px; padding: 9px 14px; text-align: left; font-family: Arial, sans-serif; font-weight: 700; width: 32%; border: 1px solid #c8cfd8; border-right: 2px solid #0f223d; }
      .spec-table td { padding: 9px 14px; font-size: 11.5px; border: 1px solid #c8cfd8; color: #333; line-height: 1.55; }
      .spec-table tr:nth-child(even) td { background: #fafbfd; }
      .access-box { border: 1px solid #c8cfd8; border-left: 4px solid #0f223d; background: #f9fafc; padding: 16px 18px; }
      .access-box p { font-size: 12px; line-height: 1.75; color: #2d2d2d; text-align: justify; }
      .doc-footer { border-top: 2px solid #0f223d; margin: 0 36px 28px; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; }
      .doc-footer span { font-size: 9px; color: #888; font-family: Arial, sans-serif; letter-spacing: .3px; }
      .doc-footer .footer-ref { color: #0f223d; font-weight: 700; }
    `;

    function competenceBlock(list, cls, label) {
      if (!list.length) return '';
      var items = list.map(function(s, i) {
        return '<div class="competence-item">'
          + '<span class="competence-num">' + String(i + 1).padStart(2, '0') + '</span>'
          + '<span>' + esc(s) + '</span>'
          + '</div>';
      }).join('');
      return '<div class="competence-block ' + cls + '">'
        + '<div class="competence-block-header">'
        + '<h4>' + label + '</h4>'
        + '<span class="count-badge">' + list.length + '</span>'
        + '</div>'
        + '<div class="competence-grid">' + items + '</div>'
        + '</div>';
    }

    var levels = [
      { id: 'debutant', label: 'Débutant',  exp: '0 – 1 an',  mult: 0.80 },
      { id: 'junior',   label: 'Junior',    exp: '1 – 3 ans', mult: 1.00 },
      { id: 'confirme', label: 'Confirmé',  exp: '3 – 5 ans', mult: 1.35 },
      { id: 'senior',   label: 'Senior',    exp: '5 – 8 ans', mult: 1.80 },
      { id: 'expert',   label: 'Expert',    exp: '8+ ans',    mult: 2.40 }
    ];
    var salRows = levels.map(function(l) {
      var mn = Math.round(baseMin * l.mult).toLocaleString('fr-FR');
      var mx = Math.round(baseMax * l.mult).toLocaleString('fr-FR');
      var isJunior = l.id === 'junior';
      return '<tr' + (isJunior ? ' class="sal-highlight"' : '') + '>'
        + '<td>' + l.label + '</td>'
        + '<td>' + l.exp + '</td>'
        + '<td class="sal-range">' + mn + ' TND</td>'
        + '<td class="sal-range">' + mx + ' TND</td>'
        + '<td style="font-size:10px;color:#666;">/mois · brut</td>'
        + '</tr>';
    }).join('');

    var envSt   = (m.environnementStructures || []).join(', ') || 'Non renseigné au référentiel';
    var envSec  = (m.environnementSecteurs || []).join(', ')   || 'Non renseigné au référentiel';
    var envCond = (m.environnementConditions || []).join(', ') || 'Non renseigné au référentiel';

    function section(num, title, accentLabel, body) {
      return '<div class="section">'
        + '<div class="section-header">'
        + '<span class="section-num">ART. ' + num + '</span>'
        + '<span class="section-title">' + title + '</span>'
        + (accentLabel ? '<span class="section-title-accent">' + accentLabel + '</span>' : '')
        + '</div>'
        + body
        + '</div>';
    }

    var appellationsHTML = m.appellations && m.appellations.length
      ? '<div style="margin-top:12px;"><div style="font-size:10px;font-family:Arial,sans-serif;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px;">Appellations & Intitulés associés</div>'
        + '<div class="appellation-grid">' + m.appellations.map(function(a){ return '<span class="appellation-item">' + esc(a) + '</span>'; }).join('') + '</div>'
        + '</div>'
      : '';

    var s01 = section('01', 'Désignation et Définition du Métier', '',
      '<p class="desc-text">' + esc(m.definition || m.resume || 'Aucune description spécifique fournie dans ce référentiel.') + '</p>'
      + appellationsHTML
    );

    var s02 = section('02', 'Estimation Salariale par Niveau d\'Expérience', 'Indicatif - TND',
      '<table class="salary-table">'
      + '<thead><tr><th>Niveau</th><th>Expérience</th><th>Salaire Min.</th><th>Salaire Max.</th><th>Unité</th></tr></thead>'
      + '<tbody>' + salRows + '</tbody>'
      + '</table>'
      + '<p style="font-size:9px;color:#999;font-family:Arial,sans-serif;margin-top:6px;font-style:italic;">* Données indicatives issues du référentiel. Les salaires effectifs peuvent varier selon les conventions collectives et le secteur d\'activité.</p>'
    );

    var s03 = section('03', 'Référentiel Détaillé des Compétences', totalSkills + ' Compétences',
      competenceBlock(sfList, 'sf', 'I. Savoir-faire techniques et opérationnels')
      + competenceBlock(svList, 'sv', 'II. Connaissances théoriques et savoirs associés')
      + competenceBlock(ssList, 'ss', 'III. Compétences comportementales (Aptitudes transversales)')
      + competenceBlock(snList, 'sn', 'IV. Compétences numériques et maîtrise des outils')
      + (!totalSkills ? '<p style="color:#999;font-size:12px;font-style:italic;text-align:center;padding:16px;">Aucune compétence renseignée pour ce métier.</p>' : '')
    );

    var s04 = section('04', 'Environnement et Conditions d\'Exercice', '',
      '<table class="spec-table"><tbody>'
      + '<tr><th>Structures d\'exercice</th><td>' + esc(envSt) + '</td></tr>'
      + '<tr><th>Secteurs d\'activité</th><td>' + esc(envSec) + '</td></tr>'
      + '<tr><th>Conditions & contraintes</th><td>' + esc(envCond) + '</td></tr>'
      + '</tbody></table>'
    );

    var s05 = section('05', 'Conditions d\'Accès à l\'Emploi et Qualifications Requises', '',
      '<div class="access-box"><p>' + esc(m.accesEmploi || 'L\'accès à cet emploi est soumis aux règles de qualification, de diplôme ou d\'expérience professionnelle exigées par le référentiel officiel.') + '</p></div>'
    );

    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'
      + '<style>' + css + '</style>'
      + '</head><body><div class="page">'
      + '<div class="doc-header">'
      + '<div class="doc-header-top">'
      + '<div class="doc-header-logo">'
      + '<div class="logo-symbol">📄</div>'
      + '<div class="logo-text">Référentiel<br>National</div>'
      + '</div>'
      + '<div class="doc-header-main">'
      + '<div class="doc-header-type">Fiche Officielle du Référentiel National des Métiers</div>'
      + '<div class="doc-header-title">' + esc(m.titre) + '</div>'
      + '<div class="doc-header-meta">'
      + '<span>Code : <strong>' + esc(m.code) + '</strong></span>'
      + '<span>Domaine : <strong>' + esc(m.domaineGrand) + '</strong></span>'
      + (m.domaineProfessionnel ? '<span>Secteur : <strong>' + esc(m.domaineProfessionnel) + '</strong></span>' : '')
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="doc-header-ref">'
      + '<span>' + dateStr + '</span>'
      + '<span>Edition 2026</span>'
      + '<span class="ref-badge">' + refNum + '</span>'
      + '</div>'
      + '</div>'
      + '<div class="stats-strip">'
      + '<div class="stat-box"><div class="stat-num">' + sfList.length + '</div><div class="stat-lbl">Savoir-faire</div></div>'
      + '<div class="stat-box"><div class="stat-num">' + svList.length + '</div><div class="stat-lbl">Savoirs</div></div>'
      + '<div class="stat-box"><div class="stat-num">' + ssList.length + '</div><div class="stat-lbl">Soft Skills</div></div>'
      + '<div class="stat-box"><div class="stat-num">' + snList.length + '</div><div class="stat-lbl">Numérique</div></div>'
      + '<div class="stat-box" style="background:#0f223d;"><div class="stat-num" style="color:#EF7408;">' + totalSkills + '</div><div class="stat-lbl" style="color:rgba(255,255,255,.7);">Total</div></div>'
      + '</div>'
      + '<div class="doc-body">'
      + s01 + s02 + s03 + s04 + s05
      + '</div>'
      + '<div class="doc-footer">'
      + '<span>Référentiel National des Métiers — Document officiel à usage professionnel</span>'
      + '<span class="footer-ref">' + refNum + '</span>'
      + '<span>Page générée le ' + dateStr + '</span>'
      + '</div>'
      + '</div></body></html>';
  }

  function loadScript(url, cb) {
    if (document.querySelector('script[data-pdf-lib="' + url + '"]')) { cb(); return; }
    var s = document.createElement('script');
    s.setAttribute('data-pdf-lib', url);
    s.src = url;
    s.onload = cb;
    s.onerror = function() {
      alert('Erreur réseau. Vérifiez votre connexion.');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    };
    document.head.appendChild(s);
  }

  function generate() {
    var htmlContent = buildPDFHTML(metier);

    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-99999px;left:0;width:794px;height:2000px;border:none;z-index:-9999;visibility:hidden;';
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();

    setTimeout(function() {
      var body = iframe.contentDocument.body;
      var captureH = body.scrollHeight || 2000;
      iframe.style.height = captureH + 'px';

      setTimeout(function() {
        html2canvas(body, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollX: 0, scrollY: 0,
          width: 794,
          height: captureH,
          windowWidth: 794,
          windowHeight: captureH
        }).then(function(canvas) {
          document.body.removeChild(iframe);

          if (canvas.width < 10 || canvas.height < 10) {
            alert('Erreur: contenu vide capturé.');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            return;
          }

          var jsPDF = window.jspdf.jsPDF;
          var pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

          var pageW = 210, pageH = 297;
          var imgW = canvas.width, imgH = canvas.height;
          var mmPerPx = pageW / imgW;
          var pxPerPage = pageH / mmPerPx;

          var srcY = 0, pageNum = 0;
          while (srcY < imgH) {
            if (pageNum > 0) pdf.addPage();
            var slicePx = Math.min(pxPerPage, imgH - srcY);
            var tmp = document.createElement('canvas');
            tmp.width = imgW;
            tmp.height = Math.ceil(slicePx);
            var ctx = tmp.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tmp.width, tmp.height);
            ctx.drawImage(canvas, 0, Math.floor(srcY), imgW, Math.ceil(slicePx), 0, 0, imgW, Math.ceil(slicePx));
            pdf.addImage(tmp.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, slicePx * mmPerPx, '', 'FAST');
            srcY += slicePx;
            pageNum++;
          }

          pdf.save(filename);
          btn.innerHTML = originalHTML;
          btn.disabled = false;

        }).catch(function(err) {
          document.body.removeChild(iframe);
          console.error(err);
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          alert('Erreur: ' + err.message);
        });
      }, 800);
    }, 500);
  }

  var h2cUrl  = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  var pdfUrl  = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  loadScript(h2cUrl, function() { loadScript(pdfUrl, generate); });
};

