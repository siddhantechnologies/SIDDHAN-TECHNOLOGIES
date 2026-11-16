/**
 * SIDDHAN TECHNOLOGIES | 3D, Game Art & Creative Media Career Directory Application
 * Core Interactive Logic, Mobile State Controller & Responsive Engine
 */

(function () {
  'use strict';

  // Application State
  const state = {
    activeSoftware: 'all',
    searchQuery: '',
    selectedIndustry: 'all',
    selectedHub: 'all',
    sortBy: 'default',
    activeView: 'cards', // 'cards' | 'table' | 'analytics' | 'roadmaps' | 'compare'
    bookmarks: new Set(JSON.parse(localStorage.getItem('siddhan_bookmarks') || localStorage.getItem('iyal_bookmarks') || localStorage.getItem('nexus3d_bookmarks') || '[]')),
    compareList: new Set(JSON.parse(localStorage.getItem('siddhan_compare') || localStorage.getItem('iyal_compare') || localStorage.getItem('nexus3d_compare') || '[]')),
    wizardStep: 1,
    wizardAnswers: {}
  };

  const COURSE_CAREER_ROLE_MAP = {
    '3d character animator': 'MAYA-01',
    'character rigger': 'MAYA-02',
    'look dev artist': 'MAYA-05',
    'realtime 3d artist': 'UE5-06',
    'environment artist': 'MAYA-08',
    'unreal developer': 'UE5-01',
    'blender 3d artist': 'MAX-07',
    '3d modeler': 'MAX-03',
    'procedural artist': 'MAX-04',
    'character animator': 'MAYA-01',
    'mocap specialist': 'MAYA-01',
    'creature animator': 'MAYA-01',
    'video editor': 'PR-01',
    'nuke compositor': 'NK-01',
    'motion designer': 'AE-01',
    'colorist': 'DR-01',
    'broadcast designer': 'AE-01',
    'title animator': 'AE-03',
    'vfx compositor': 'NK-01',
    'roto paint prep artist': 'NK-02',
    'matchmove artist': 'NK-05',
    'after effects artist': 'AE-01',
    'video compositor': 'AE-02',
    'sound designer': 'AU-03',
    'podcast audio engineer': 'AU-02',
    'digital media specialist': 'PS-04',
    'ui ux designer': 'AE-04',
    'creative director': 'PS-04',
    'graphic designer': 'PS-04',
    'web designer': 'AE-04',
    '2d animator': 'AE-05',
    'product designer': 'MAX-05',
    'interaction designer': 'AE-04',
    'packaging designer': 'PS-04',
    'prepress artist': 'PS-04'
  };

  // DOM Elements Cache
  const DOM = {
    rolesGrid: document.getElementById('rolesGrid'),
    matrixTableBody: document.getElementById('matrixTableBody'),
    rolesCountDisplay: document.getElementById('rolesCountDisplay'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    industryFilter: document.getElementById('industryFilter'),
    hubFilter: document.getElementById('hubFilter'),
    sortSelect: document.getElementById('sortSelect'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    softwareStrip: document.getElementById('softwareStrip'),
    activeFilterChips: document.getElementById('activeFilterChips'),
    navTabs: document.querySelectorAll('.nav-tab-btn'),
    mobileNavItems: document.querySelectorAll('.mobile-nav-item'),
    viewToggles: document.querySelectorAll('.btn-view-toggle'),
    views: {
      cards: document.getElementById('viewCards'),
      table: document.getElementById('viewTable'),
      analytics: document.getElementById('viewAnalytics'),
      roadmaps: document.getElementById('viewRoadmaps'),
      compare: document.getElementById('viewCompare')
    },
    bookmarkCountBadge: document.getElementById('bookmarkCountBadge'),
    compareCountBadge: document.getElementById('compareCountBadge'),
    mobileSavedBadge: document.getElementById('mobileSavedBadge'),
    mobileFilterIndicator: document.getElementById('mobileFilterIndicator'),
    roleModal: document.getElementById('roleModal'),
    roleModalContent: document.getElementById('roleModalContent'),
    bookmarksModal: document.getElementById('bookmarksModal'),
    bookmarksModalContent: document.getElementById('bookmarksModalContent'),
    wizardModal: document.getElementById('wizardModal'),
    wizardModalContent: document.getElementById('wizardModalContent'),
    mobileFilterModal: document.getElementById('mobileFilterModal'),
    mobileSwSelect: document.getElementById('mobileSwSelect'),
    mobileIndSelect: document.getElementById('mobileIndSelect'),
    mobileHubSelect: document.getElementById('mobileHubSelect'),
    mobileSortSelect: document.getElementById('mobileSortSelect'),
    toastContainer: document.getElementById('toastContainer'),
    themeToggleBtn: document.getElementById('themeToggleBtn')
  };

  /**
   * Initialize Application
   */
  function init() {
    const backToTopButton = document.getElementById('bttBtn');
    const updateBackToTopButton = () => {
      backToTopButton?.classList.toggle('visible', window.scrollY > 300);
    };
    window.addEventListener('scroll', updateBackToTopButton, { passive: true });
    updateBackToTopButton();
    backToTopButton?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    initTheme();
    initDynamicPortalLinks();
    renderSoftwareFilterStrip();
    populateDropdowns();
    renderAnalytics();
    renderRoadmaps();
    updateBadges();
    applyFilters();
    bindEvents();
    openCareerRoleFromUrl();
  }

  /**
   * Dynamic Portal Links Resolver
   * Intelligently computes relative paths for seamless cross-portal navigation
   */
  function initDynamicPortalLinks() {
    try {
      const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
      const isMaacFolder = path.includes('/maac');
      
      const courseUrl = isMaacFolder ? '../Course/index.html' : 'Course/index.html';
      const careerUrl = isMaacFolder ? 'index.html' : 'Maac/index.html';
      const hubUrl = isMaacFolder ? '../index.html' : 'index.html';

      document.querySelectorAll('[data-portal-link="course"]').forEach(el => {
        el.setAttribute('href', courseUrl);
      });
      document.querySelectorAll('[data-portal-link="career"]').forEach(el => {
        el.setAttribute('href', careerUrl);
      });
      document.querySelectorAll('[data-portal-link="hub"]').forEach(el => {
        el.setAttribute('href', hubUrl);
      });
    } catch (e) {
      console.warn('Dynamic portal link resolution error:', e);
    }
  }

  /**
   * Theme Support
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('siddhan_theme') || localStorage.getItem('iyal_theme') || localStorage.getItem('nexus3d_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('siddhan_theme', next);
    showToast(`Switched to ${next} theme mode`, 'info');
  }

  /**
   * Render Top Software Filter Strip (Horizontal Swipeable for 11 Suites)
   */
  function renderSoftwareFilterStrip() {
    if (!DOM.softwareStrip) return;

    let html = `
      <button class="software-filter-pill ${state.activeSoftware === 'all' ? 'active' : ''}" data-sw="all">
        <span>All Software</span>
        <span class="sw-count">85 Roles</span>
      </button>
    `;

    Object.values(SOFTWARE_METADATA).forEach(sw => {
      const isActive = state.activeSoftware === sw.id;
      html += `
        <button class="software-filter-pill ${isActive ? 'active' : ''}" data-sw="${sw.id}">
          <span class="sw-dot" style="background: ${sw.color}; box-shadow: 0 0 8px ${sw.color};"></span>
          <span>${sw.shortName}</span>
          <span class="sw-count">${sw.roleCount}</span>
        </button>
      `;
    });

    DOM.softwareStrip.innerHTML = html;

    // Attach click listeners
    DOM.softwareStrip.querySelectorAll('.software-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const sw = btn.getAttribute('data-sw');
        setSoftwareFilter(sw);
      });
    });
  }

  /**
   * Populate Industry & Hub Dropdowns Dynamically
   */
  function populateDropdowns() {
    // Extract unique industries across all 85 roles
    const industrySet = new Set();
    ROLES_DATA.forEach(r => {
      const parts = r.industry.split(',').map(s => s.trim());
      parts.forEach(p => industrySet.add(p));
    });

    const sortedIndustries = Array.from(industrySet).sort();

    // Populate Desktop & Mobile Industry Dropdowns
    sortedIndustries.forEach(ind => {
      if (DOM.industryFilter) {
        const opt = document.createElement('option');
        opt.value = ind;
        opt.textContent = ind;
        DOM.industryFilter.appendChild(opt);
      }
      if (DOM.mobileIndSelect) {
        const opt2 = document.createElement('option');
        opt2.value = ind;
        opt2.textContent = ind;
        DOM.mobileIndSelect.appendChild(opt2);
      }
    });

    // Top Production Hubs from Dataset
    const hubs = [
      "Bengaluru",
      "Mumbai",
      "Chennai",
      "Delhi NCR",
      "Hyderabad",
      "Pune",
      "Kochi",
      "Mohali",
      "Gurugram",
      "Remote"
    ];

    hubs.forEach(h => {
      if (DOM.hubFilter) {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        DOM.hubFilter.appendChild(opt);
      }
      if (DOM.mobileHubSelect) {
        const opt2 = document.createElement('option');
        opt2.value = h;
        opt2.textContent = h;
        DOM.mobileHubSelect.appendChild(opt2);
      }
    });
  }

  /**
   * Filter and Sort Roles based on State
   */
  function getFilteredRoles() {
    return ROLES_DATA.filter(role => {
      // Software Suite Filter
      if (state.activeSoftware !== 'all' && role.softwareKey !== state.activeSoftware) {
        return false;
      }

      // Industry Filter
      if (state.selectedIndustry !== 'all') {
        const indLower = role.industry.toLowerCase();
        if (!indLower.includes(state.selectedIndustry.toLowerCase())) {
          return false;
        }
      }

      // Hub Filter
      if (state.selectedHub !== 'all') {
        const hubQuery = state.selectedHub.toLowerCase();
        const matchesHub = role.hubs.some(h => h.toLowerCase().includes(hubQuery));
        if (!matchesHub) return false;
      }

      // Search Query
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const inId = role.id.toLowerCase().includes(q);
        const inTitle = role.title.toLowerCase().includes(q);
        const inSoftware = role.software.toLowerCase().includes(q);
        const inIndustry = role.industry.toLowerCase().includes(q);
        const inResp = role.responsibilities.toLowerCase().includes(q);
        const inTools = role.companionTools.some(t => t.toLowerCase().includes(q));
        const inHubs = role.hubs.some(h => h.toLowerCase().includes(q));

        if (!inId && !inTitle && !inSoftware && !inIndustry && !inResp && !inTools && !inHubs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (state.sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'demand-desc':
          const demandRank = { 'Explosive': 4, 'Very High': 3, 'High': 2, 'Moderate': 1 };
          return (demandRank[b.demandLevel] || 0) - (demandRank[a.demandLevel] || 0);
        case 'software':
          return a.software.localeCompare(b.software);
        case 'id-asc':
        default:
          return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
    });
  }

  /**
   * Apply Filter Pipeline and Re-render Views
   */
  function applyFilters() {
    const filtered = getFilteredRoles();

    // Update Counter Display
    if (DOM.rolesCountDisplay) {
      DOM.rolesCountDisplay.innerHTML = `Showing <span>${filtered.length}</span> of <span>${ROLES_DATA.length}</span> roles`;
    }

    // Check if any filter is active for mobile indicator
    const hasActiveFilters = state.activeSoftware !== 'all' || state.selectedIndustry !== 'all' || state.selectedHub !== 'all' || state.sortBy !== 'default';
    if (DOM.mobileFilterIndicator) {
      DOM.mobileFilterIndicator.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }

    renderActiveFilterChips();
    renderCardsView(filtered);
    renderTableView(filtered);
    renderComparisonView();

    // Show/hide search clear button
    if (DOM.searchClearBtn) {
      DOM.searchClearBtn.style.display = state.searchQuery ? 'flex' : 'none';
    }
  }

  /**
   * Render Active Filter Chips Row
   */
  function renderActiveFilterChips() {
    if (!DOM.activeFilterChips) return;

    let chips = [];

    if (state.activeSoftware !== 'all') {
      const swMeta = SOFTWARE_METADATA[state.activeSoftware];
      chips.push({
        label: `Software: ${swMeta ? swMeta.shortName : state.activeSoftware}`,
        onClear: () => setSoftwareFilter('all')
      });
    }

    if (state.selectedIndustry !== 'all') {
      chips.push({
        label: `Industry: ${state.selectedIndustry}`,
        onClear: () => {
          state.selectedIndustry = 'all';
          if (DOM.industryFilter) DOM.industryFilter.value = 'all';
          if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = 'all';
          applyFilters();
        }
      });
    }

    if (state.selectedHub !== 'all') {
      chips.push({
        label: `Hub: ${state.selectedHub}`,
        onClear: () => {
          state.selectedHub = 'all';
          if (DOM.hubFilter) DOM.hubFilter.value = 'all';
          if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = 'all';
          applyFilters();
        }
      });
    }

    if (state.searchQuery) {
      chips.push({
        label: `Search: "${state.searchQuery}"`,
        onClear: () => {
          state.searchQuery = '';
          DOM.searchInput.value = '';
          applyFilters();
        }
      });
    }

    if (chips.length === 0) {
      DOM.activeFilterChips.innerHTML = '';
      return;
    }

    DOM.activeFilterChips.innerHTML = chips.map((chip, idx) => `
      <span class="filter-chip">
        ${chip.label}
        <button data-chip-idx="${idx}" title="Remove filter">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </span>
    `).join('');

    DOM.activeFilterChips.querySelectorAll('button').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        chips[idx].onClear();
      });
    });
  }

  /**
   * Render Role Cards Grid (View 1) - Touch-Optimized for Mobile
   */
  function renderCardsView(roles) {
    if (!DOM.rolesGrid) return;

    if (roles.length === 0) {
      DOM.rolesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.25rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <svg viewBox="0 0 24 24" width="44" height="44" stroke="var(--text-dim)" stroke-width="1.5" fill="none" style="margin-bottom: 0.85rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">No matching roles found</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 440px; margin: 0 auto 1.25rem;">Try clearing current filters to discover more career paths at SIDDHAN TECHNOLOGIES.</p>
          <button class="btn-primary-action" id="emptyResetBtn" style="margin: 0 auto;">Reset All Filters</button>
        </div>
      `;
      const btn = document.getElementById('emptyResetBtn');
      if (btn) btn.addEventListener('click', resetAllFilters);
      return;
    }

    DOM.rolesGrid.innerHTML = roles.map(role => {
      const sw = SOFTWARE_METADATA[role.softwareKey] || {};
      const isBookmarked = state.bookmarks.has(role.id);
      const isCompared = state.compareList.has(role.id);

      const companionToolTags = role.companionTools.map(tool => `
        <span class="tool-tag" onclick="window.SiddhanTech.filterByTool('${escapeQuotes(tool)}')">${tool}</span>
      `).join('');

      return `
        <article class="role-card" style="--accent-color: ${sw.color}; --accent-glow: ${sw.accentGlow};" data-role-id="${role.id}" tabindex="0" aria-label="Open job details for ${role.title}" aria-haspopup="dialog">
          <div class="role-card-accent-bar"></div>
          
          <div>
            <div class="role-card-header">
              <span class="role-id-badge">${role.id}</span>
              <span class="role-sw-badge ${sw.badgeClass}">
                ${sw.shortName}
              </span>
            </div>

            <h3 class="role-title"><button type="button" class="role-title-link" onclick="window.SiddhanTech.openRoleModal('${role.id}')" aria-label="Open job details for ${role.title}">${role.title}</button></h3>
            
            <div class="role-industry">
              <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              <span>${role.industry}</span>
            </div>

            <p class="role-resp">${role.responsibilities}</p>

            <div class="role-tools-section">
              <div class="section-micro-label">Companion Software & Tools</div>
              <div class="tools-chips-list">
                ${companionToolTags}
              </div>
            </div>

            <div class="role-hubs-section">
              <div class="section-micro-label">Top Hiring Hubs</div>
              <div class="hubs-text">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <div class="hub-chip-list">
                  ${role.hubs.map(hub => `<button type="button" class="tool-tag hub-filter-chip" onclick="window.SiddhanTech.filterByHub('${escapeQuotes(hub)}')" aria-label="Show jobs in ${hub}">${hub}</button>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="role-card-footer">
            <button class="btn-card-details" onclick="window.SiddhanTech.openRoleModal('${role.id}')">
              <span>View Blueprint</span>
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            
            <button class="btn-card-action-icon ${isCompared ? 'active-compare' : ''}" 
                    title="${isCompared ? 'Remove from Compare' : 'Add to Compare'}"
                    onclick="window.SiddhanTech.toggleCompare('${role.id}')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
            </button>

            <button class="btn-card-action-icon ${isBookmarked ? 'active-bookmark' : ''}" 
                    title="${isBookmarked ? 'Remove Bookmark' : 'Save to Shortlist'}"
                    onclick="window.SiddhanTech.toggleBookmark('${role.id}')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="${isBookmarked ? 'currentColor' : 'none'}"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Render Master Spreadsheet Matrix Table (View 2)
   */
  function renderTableView(roles) {
    if (!DOM.matrixTableBody) return;

    if (roles.length === 0) {
      DOM.matrixTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">No matching records found.</td>
        </tr>
      `;
      return;
    }

    DOM.matrixTableBody.innerHTML = roles.map(role => {
      const sw = SOFTWARE_METADATA[role.softwareKey] || {};

      return `
        <tr>
          <td class="col-id">${role.id}</td>
          <td class="col-suite">
            <span class="role-sw-badge ${sw.badgeClass}" style="font-size: 0.68rem; padding: 2px 7px;">
              ${sw.shortName}
            </span>
          </td>
          <td class="col-role">
            <a href="javascript:void(0)" onclick="window.SiddhanTech.openRoleModal('${role.id}')" style="color: var(--text-highlight); text-decoration: none; border-bottom: 1px dotted var(--border-medium);">
              ${role.title}
            </a>
          </td>
          <td class="col-industry">${role.industry}</td>
          <td class="col-resp">${role.responsibilities}</td>
          <td>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 240px;">
              ${role.companionTools.map(t => `<span class="tool-tag" style="font-size: 0.65rem; padding: 1px 5px;" onclick="window.SiddhanTech.filterTableByTool('${escapeQuotes(t)}')">${t}</span>`).join('')}
            </div>
          </td>
          <td style="font-size: 0.78rem; color: var(--text-dim); max-width: 190px;">
            ${role.hubs.join(', ')}
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render Ecosystem Analytics (View 3)
   */
  function renderAnalytics() {
    const swContainer = document.getElementById('analyticsSoftwareBars');
    const hubsContainer = document.getElementById('analyticsHubsList');
    const toolsContainer = document.getElementById('analyticsToolsGrid');

    if (swContainer) {
      swContainer.innerHTML = Object.values(SOFTWARE_METADATA).map(sw => `
        <div class="software-share-item">
          <div class="share-meta">
            <span class="share-sw-name" style="color: ${sw.color};">${sw.name}</span>
            <span class="share-percentage">${sw.roleCount} Roles • ${sw.sharePercent}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${sw.sharePercent}%; background: ${sw.color}; box-shadow: 0 0 10px ${sw.color};"></div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px;">
            ${sw.focus}
          </div>
        </div>
      `).join('');
    }

    if (hubsContainer) {
      hubsContainer.innerHTML = ECOSYSTEM_STATS.topHubs.map((hub, idx) => `
        <div class="hub-rank-row" onclick="window.SiddhanTech.filterByHub('${hub.name}')" style="cursor: pointer;">
          <div class="hub-rank-left">
            <span class="hub-index">#${idx + 1}</span>
            <div>
              <div class="hub-name">${hub.name}</div>
              <div class="hub-note">${hub.note}</div>
            </div>
          </div>
          <span class="hub-count-badge">${hub.count} Roles Active</span>
        </div>
      `).join('');
    }

    if (toolsContainer) {
      toolsContainer.innerHTML = ECOSYSTEM_STATS.popularCompanionTools.map(tool => `
        <div class="synergy-tool-box" onclick="window.SiddhanTech.filterByTool('${escapeQuotes(tool.name)}')" style="cursor: pointer;">
          <div class="synergy-tool-count">${tool.count}</div>
          <div class="synergy-tool-name">${tool.name}</div>
        </div>
      `).join('');
    }
  }

  /**
   * Render Career Pathways & Roadmaps (View 4)
   */
  function renderRoadmaps() {
    const container = document.getElementById('pipelinesContainer');
    if (!container) return;

    container.innerHTML = ECOSYSTEM_STATS.pipelines.map(pipe => `
      <section class="pipeline-card">
        <div class="pipeline-header">
          <div class="pipeline-tag">Studio Pipeline Blueprint</div>
          <h3 class="pipeline-title">${pipe.title}</h3>
          <p class="pipeline-desc">${pipe.description}</p>
        </div>

        <div class="pipeline-steps-flow">
          ${pipe.steps.map((st, i) => `
            <div class="step-card">
              <span class="step-number">PHASE 0${i + 1}</span>
              <div class="step-phase">${st.phase}</div>
              <div class="step-role">${st.role}</div>
              <div class="step-sw">${st.software}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `).join('');
  }

  /**
   * Render Role Comparison Tray (View 5)
   */
  function renderComparisonView() {
    const container = document.getElementById('comparisonContainer');
    if (!container) return;

    const list = Array.from(state.compareList);

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1.25rem;">
          <svg viewBox="0 0 24 24" width="44" height="44" stroke="var(--text-dim)" stroke-width="1.5" fill="none" style="margin-bottom: 0.85rem;"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">No roles selected for comparison</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 440px; margin: 0 auto 1.25rem;">Tap the compare icon on any role card to compare up to 3 roles side-by-side.</p>
          <button class="btn-primary-action" onclick="window.SiddhanTech.switchView('cards')" style="margin: 0 auto;">Browse All 85 Roles</button>
        </div>
      `;
      return;
    }

    const comparedRoles = list.map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 style="font-size: 1.2rem;">Side-by-Side Role Matrix</h3>
          <p style="color: var(--text-muted); font-size: 0.82rem;">Comparing ${comparedRoles.length} of 3 maximum roles</p>
        </div>
        <button class="btn-reset-filters" onclick="window.SiddhanTech.clearCompare()">Clear Comparison</button>
      </div>

      <div class="comparison-grid">
        ${comparedRoles.map(role => {
          const sw = SOFTWARE_METADATA[role.softwareKey] || {};
          return `
            <div class="compare-column" style="border-top: 3px solid ${sw.color};">
              <button class="compare-remove-btn" onclick="window.SiddhanTech.toggleCompare('${role.id}')" title="Remove role">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <span class="role-id-badge" style="width: fit-content; margin-bottom: 0.4rem;">${role.id}</span>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">${role.title}</h4>
              <span class="role-sw-badge ${sw.badgeClass}" style="width: fit-content; margin-bottom: 1.1rem;">${sw.name}</span>

              <div class="compare-metric-block">
                <div class="compare-metric-title">Primary Industry</div>
                <div class="compare-metric-val" style="color: #38bdf8;">${role.industry}</div>
              </div>

              <div class="compare-metric-block">
                <div class="compare-metric-title">Core Responsibilities</div>
                <div class="compare-metric-val">${role.responsibilities}</div>
              </div>

              <div class="compare-metric-block">
                <div class="compare-metric-title">Companion Software</div>
                <div class="tools-chips-list">
                  ${role.companionTools.map(t => `<span class="tool-tag">${t}</span>`).join('')}
                </div>
              </div>

              <div class="compare-metric-block">
                <div class="compare-metric-title">High-Demand Hubs</div>
                <div class="compare-metric-val" style="font-size: 0.8rem; color: var(--text-dim);">${role.hubs.join(', ')}</div>
              </div>

              <div class="compare-metric-block">
                <div class="compare-metric-title">Demand Rating</div>
                <div class="compare-metric-val" style="color: #22c55e; font-weight: 700;">${role.demandLevel}</div>
              </div>

              <button class="btn-primary-action" style="margin-top: auto;" onclick="window.SiddhanTech.openRoleModal('${role.id}')">
                Open Blueprint
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Open Detailed Role Modal (Blueprint)
   */
  function openRoleModal(roleId) {
    const role = ROLES_DATA.find(r => r.id === roleId);
    if (!role || !DOM.roleModal || !DOM.roleModalContent) return;

    const sw = SOFTWARE_METADATA[role.softwareKey] || {};
    const isBookmarked = state.bookmarks.has(role.id);

    DOM.roleModalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <span class="role-id-badge" style="font-size: 0.8rem;">${role.id}</span>
            <span class="role-sw-badge ${sw.badgeClass}">${sw.name}</span>
            <span style="font-size: 0.72rem; font-family: var(--font-mono); color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 7px; border-radius: var(--radius-full); border: 1px solid rgba(34, 197, 94, 0.25);">
              ● ${role.demandLevel} Demand
            </span>
          </div>
          <h2 style="font-size: 1.45rem;">${role.title}</h2>
          <div style="color: #38bdf8; font-size: 0.85rem; margin-top: 0.2rem;">${role.industry}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="modal-close-btn" onclick="window.SiddhanTech.closeModal('roleModal')">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-detail-row">
          <div class="modal-section-title">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Core Industry Responsibilities
          </div>
          <p class="modal-text" style="font-size: 1rem; font-weight: 500;">${role.responsibilities}</p>
        </div>

        <div class="modal-detail-row">
          <div class="modal-section-title">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Day-In-The-Life & Production Workflow
          </div>
          <p class="modal-text">${role.dayInTheLife || 'Active daily pipeline involvement in multi-department asset creation, code integration, and director milestone reviews.'}</p>
        </div>

        <div class="modal-detail-row">
          <div class="modal-section-title">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Full Companion Software Ecosystem
          </div>
          <div class="tools-chips-list" style="margin-top: 0.4rem;">
            ${role.companionTools.map(tool => `<button type="button" class="tool-tag modal-tool-tag" onclick="window.SiddhanTech.filterByTool('${escapeQuotes(tool)}')" aria-label="Show job roles using ${tool}" style="font-size: 0.8rem; padding: 0.3rem 0.7rem;">${tool}</button>`).join('')}
          </div>
        </div>

        <div class="modal-detail-row">
          <div class="modal-highlight-box">
            <div class="modal-section-title" style="color: var(--primary);">
              <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              Hiring Portfolio Recommendation
            </div>
            <p class="modal-text" style="color: var(--text-main); font-size: 0.88rem;">
              ${role.portfolioTip || 'Build a cohesive 3-piece portfolio project showing high-to-low poly workflow, clean topology, and real-time engine integration.'}
            </p>
          </div>
        </div>

        <div class="modal-detail-row">
          <div class="modal-section-title">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Key Production Hubs & Markets
          </div>
          <div class="modal-hubs-list">
            ${role.hubs.map(hub => `<button type="button" class="tool-tag modal-tool-tag modal-hub-link" onclick="window.SiddhanTech.filterByHub('${escapeQuotes(hub)}')" aria-label="Show jobs in ${hub}" style="font-size: 0.8rem; padding: 0.3rem 0.7rem;">${hub}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-card-action-icon ${isBookmarked ? 'active-bookmark' : ''}" 
                onclick="window.SiddhanTech.toggleBookmark('${role.id}'); window.SiddhanTech.openRoleModal('${role.id}');"
                title="Save to My Shortlist">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="${isBookmarked ? 'currentColor' : 'none'}"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        </button>

        <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
          <button class="btn-pdf-action" onclick="window.SiddhanTech.exportSingleRolePDF('${role.id}')" title="Download Role Blueprint PDF" style="padding: 0.45rem 0.95rem; font-size: 0.78rem;">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>PDF Blueprint</span>
          </button>
          <button class="btn-reset-filters" onclick="window.SiddhanTech.copyRoleShareText('${role.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
          </button>
          <button class="btn-primary-action" onclick="window.SiddhanTech.closeModal('roleModal')">
            Close
          </button>
        </div>
      </div>
    `;

    DOM.roleModal.classList.add('active');
  }

  function normalizeCareerRoleLabel(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function openCareerRoleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const requestedLabel = params.get('career');
    if (!requestedLabel) {
      const requestedSoftware = params.get('software');
      if (requestedSoftware && SOFTWARE_METADATA[requestedSoftware]) {
        setSoftwareFilter(requestedSoftware);
        return;
      }

      const requestedHub = params.get('hub');
      if (requestedHub) {
        requestAnimationFrame(() => filterByHub(requestedHub));
        return;
      }

      const requestedView = params.get('view');
      const viewTargets = {
        cards: 'viewCards',
        table: 'viewTable',
        analytics: 'viewAnalytics',
        roadmaps: 'viewRoadmaps',
        compare: 'viewCompare'
      };
      if (requestedView && viewTargets[requestedView]) {
        switchView(requestedView);
        requestAnimationFrame(() => document.getElementById(viewTargets[requestedView])?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
      return;
    }

    const normalizedLabel = normalizeCareerRoleLabel(requestedLabel);
    const mappedRoleId = COURSE_CAREER_ROLE_MAP[normalizedLabel];
    const role = ROLES_DATA.find(item => item.id === mappedRoleId) ||
      ROLES_DATA.find(item => normalizeCareerRoleLabel(item.title) === normalizedLabel);

    if (!role) {
      showToast(`No job details found for ${requestedLabel}`, 'warning');
      return;
    }

    switchView('cards');
    requestAnimationFrame(() => openRoleModal(role.id));
  }

  /**
   * Mobile Filter Sheet Trigger
   */
  function openMobileFilterModal() {
    if (!DOM.mobileFilterModal) return;

    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = state.activeSoftware;
    if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = state.selectedIndustry;
    if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = state.selectedHub;
    if (DOM.mobileSortSelect) DOM.mobileSortSelect.value = state.sortBy;

    DOM.mobileFilterModal.classList.add('active');
  }

  function applyMobileFilters() {
    if (DOM.mobileSwSelect) {
      state.activeSoftware = DOM.mobileSwSelect.value;
      renderSoftwareFilterStrip();
    }
    if (DOM.mobileIndSelect) {
      state.selectedIndustry = DOM.mobileIndSelect.value;
      if (DOM.industryFilter) DOM.industryFilter.value = state.selectedIndustry;
    }
    if (DOM.mobileHubSelect) {
      state.selectedHub = DOM.mobileHubSelect.value;
      if (DOM.hubFilter) DOM.hubFilter.value = state.selectedHub;
    }
    if (DOM.mobileSortSelect) {
      state.sortBy = DOM.mobileSortSelect.value;
      if (DOM.sortSelect) DOM.sortSelect.value = state.sortBy;
    }

    if (state.activeView !== 'cards' && state.activeView !== 'table') {
      switchView('cards');
    }
    applyFilters();
    showToast('Applied custom filters', 'info');
  }

  /**
   * Open Career Matcher Wizard
   */
  function openCareerWizard() {
    state.wizardStep = 1;
    state.wizardAnswers = {};
    renderWizardStep();
    DOM.wizardModal.classList.add('active');
  }

  function renderWizardStep() {
    if (!DOM.wizardModalContent) return;

    if (state.wizardStep === 1) {
      DOM.wizardModalContent.innerHTML = `
        <div class="modal-header">
          <div>
            <div class="pipeline-tag">Step 1 of 3</div>
            <h2 style="font-size: 1.3rem;">What drives your creative passion?</h2>
          </div>
          <button class="modal-close-btn" onclick="window.SiddhanTech.closeModal('wizardModal')">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="wizard-step-indicator">
            <div class="wizard-step-dot active"></div>
            <div class="wizard-step-dot"></div>
            <div class="wizard-step-dot"></div>
          </div>
          <div class="wizard-options-list">
            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'realtime_games')">
              <div>
                <strong>Interactive Games & Real-Time Worlds</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">C++, Blueprints, Level Design, Niagara VFX, Nanite environments (UE5, 3ds Max)</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'vfx_film')">
              <div>
                <strong>Feature Film VFX, Animation & Compositing</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Character rigging, creature anim, deep comp, green screen, CG integration (Maya, Nuke)</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'video_editing')">
              <div>
                <strong>Video Editing, Post-Production & Color Grading</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Narrative cuts, trailers, YouTube media, DI color science (Premiere Pro, Resolve)</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'motion_audio')">
              <div>
                <strong>Motion Graphics, UI Animation & Audio Design</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Kinetic typography, Lottie/UI motion, dialogue repair, SFX mixing (After Effects, Audition)</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'matte_concept')">
              <div>
                <strong>Matte Painting, 2D Art & Photo Compositing</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Photorealistic set extensions, game textures, concept art, clean plates (Photoshop)</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'texturing_surfacing')">
              <div>
                <strong>PBR Materials, Texturing & Surfacing</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Substance Painter smart masks, photorealism, weathering, UDIM workflows</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'archviz_spaces')">
              <div>
                <strong>Photorealistic Architecture & Spaces</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">3ds Max, V-Ray, Corona, CAD blueprints, lighting & interior luxury styling</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('passion', 'digital_fashion')">
              <div>
                <strong>Digital Fashion & Virtual Garments</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Marvelous Designer pattern cuts, dynamic cloth physics, avatar costumes</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    } else if (state.wizardStep === 2) {
      DOM.wizardModalContent.innerHTML = `
        <div class="modal-header">
          <div>
            <div class="pipeline-tag">Step 2 of 3</div>
            <h2 style="font-size: 1.3rem;">What is your technical / artistic preference?</h2>
          </div>
          <button class="modal-close-btn" onclick="window.SiddhanTech.closeModal('wizardModal')">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="wizard-step-indicator">
            <div class="wizard-step-dot active"></div>
            <div class="wizard-step-dot active"></div>
            <div class="wizard-step-dot"></div>
          </div>
          <div class="wizard-options-list">
            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('profile', 'pure_artistic')">
              <div>
                <strong>100% Pure Artistic & Aesthetics</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Painting, sculpting, color grading, animation timing, storytelling pacing</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('profile', 'technical_code')">
              <div>
                <strong>Technical Direction & Programming</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Python scripting, C++, rigging math, pipeline tools, gizmos, game mechanics</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button class="wizard-option-btn" onclick="window.SiddhanTech.setWizardAnswer('profile', 'hybrid')">
              <div>
                <strong>Balanced Hybrid (Creative + Technical Pipeline)</strong>
                <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">Node graphs (Nuke/Fusion), Blueprints, ACES color management, conform workflows</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    } else if (state.wizardStep === 3) {
      const matches = calculateWizardMatches(state.wizardAnswers);

      DOM.wizardModalContent.innerHTML = `
        <div class="modal-header">
          <div>
            <div class="pipeline-tag" style="color: #22c55e;">Match Results</div>
            <h2 style="font-size: 1.3rem;">Top Career Matches for Your Profile</h2>
          </div>
          <button class="modal-close-btn" onclick="window.SiddhanTech.closeModal('wizardModal')">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="wizard-step-indicator">
            <div class="wizard-step-dot active"></div>
            <div class="wizard-step-dot active"></div>
            <div class="wizard-step-dot active"></div>
          </div>

          <p style="color: var(--text-muted); margin-bottom: 1.25rem; font-size: 0.9rem;">
            Based on your passion for <strong>${formatAnswer(state.wizardAnswers.passion)}</strong> and your <strong>${formatAnswer(state.wizardAnswers.profile)}</strong> style, here are your best-aligned industry paths at SIDDHAN TECHNOLOGIES:
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${matches.map(role => {
              const sw = SOFTWARE_METADATA[role.softwareKey] || {};
              return `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-medium); border-left: 4px solid ${sw.color}; border-radius: var(--radius-md); padding: 1.15rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                    <div>
                      <span class="role-id-badge" style="font-size: 0.7rem;">${role.id}</span>
                      <span class="role-sw-badge ${sw.badgeClass}" style="margin-left: 0.35rem;">${sw.name}</span>
                    </div>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #22c55e;">${role.demandLevel} Demand</span>
                  </div>
                  <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">${role.title}</h4>
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">${role.responsibilities}</p>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${role.hubs.slice(0, 3).join(', ')}</div>
                    <button class="btn-card-details" style="flex: 0 0 auto; padding: 0.35rem 0.75rem;" onclick="window.SiddhanTech.closeModal('wizardModal'); window.SiddhanTech.openRoleModal('${role.id}')">
                      Explore Role
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-reset-filters" onclick="window.SiddhanTech.openCareerWizard()">Restart Quiz</button>
          <button class="btn-primary-action" onclick="window.SiddhanTech.closeModal('wizardModal')">Done</button>
        </div>
      `;
    }
  }

  function setWizardAnswer(key, val) {
    state.wizardAnswers[key] = val;
    state.wizardStep++;
    renderWizardStep();
  }

  function calculateWizardMatches(answers) {
    let swKey = 'unreal';
    if (answers.passion === 'vfx_film') swKey = 'nuke';
    else if (answers.passion === 'video_editing') swKey = 'premiere';
    else if (answers.passion === 'motion_audio') swKey = 'aftereffects';
    else if (answers.passion === 'matte_concept') swKey = 'photoshop';
    else if (answers.passion === 'texturing_surfacing') swKey = 'substance';
    else if (answers.passion === 'archviz_spaces') swKey = 'max';
    else if (answers.passion === 'digital_fashion') swKey = 'marvelous';

    let candidates = ROLES_DATA.filter(r => r.softwareKey === swKey);

    if (answers.profile === 'technical_code') {
      const techRoles = candidates.filter(r => r.category === 'Tech Art & Code' || r.category === 'VFX & Compositing' || r.category === 'VFX & Sim');
      if (techRoles.length > 0) candidates = techRoles;
    } else if (answers.profile === 'pure_artistic') {
      const artRoles = candidates.filter(r => r.category !== 'Tech Art & Code');
      if (artRoles.length > 0) candidates = artRoles;
    }

    return candidates.slice(0, 3);
  }

  function formatAnswer(str) {
    if (!str) return '';
    return str.replace(/_/g, ' ').toUpperCase();
  }

  /**
   * Shortlist / Bookmarks Drawer
   */
  function openBookmarksModal() {
    const list = Array.from(state.bookmarks);
    const bookmarkedRoles = list.map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);

    DOM.bookmarksModalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <div class="pipeline-tag">SIDDHAN TECHNOLOGIES Portfolio</div>
          <h2 style="font-size: 1.3rem;">Saved Roles Shortlist (${bookmarkedRoles.length})</h2>
        </div>
        <button class="modal-close-btn" onclick="window.SiddhanTech.closeModal('bookmarksModal')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        ${bookmarkedRoles.length === 0 ? `
          <div style="text-align: center; padding: 2.75rem 1rem;">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="var(--text-dim)" stroke-width="1.5" fill="none" style="margin-bottom: 0.85rem;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            <h4 style="margin-bottom: 0.35rem;">Your shortlist is empty</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Bookmark roles while exploring to build your targeted career roadmap at SIDDHAN TECHNOLOGIES.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
            ${bookmarkedRoles.map(role => {
              const sw = SOFTWARE_METADATA[role.softwareKey] || {};
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.8rem 0.95rem;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.15rem;">
                      <span class="role-id-badge" style="font-size: 0.68rem;">${role.id}</span>
                      <span class="role-sw-badge ${sw.badgeClass}" style="font-size: 0.65rem; padding: 1px 6px;">${sw.shortName}</span>
                    </div>
                    <div style="font-weight: 700; color: var(--text-highlight); font-size: 0.95rem;">${role.title}</div>
                    <div style="font-size: 0.75rem; color: #38bdf8;">${role.industry}</div>
                  </div>
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="btn-card-details" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="window.SiddhanTech.closeModal('bookmarksModal'); window.SiddhanTech.openRoleModal('${role.id}')">View</button>
                    <button class="btn-card-action-icon active-bookmark" onclick="window.SiddhanTech.toggleBookmark('${role.id}'); window.SiddhanTech.openBookmarksModal();" title="Remove">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.65rem; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <button class="btn-pdf-action" onclick="window.SiddhanTech.exportShortlistPDF()" title="Download PDF Dossier">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Download PDF
            </button>
            <button class="btn-reset-filters" onclick="window.SiddhanTech.printShortlistPDF()" title="Print / Save as PDF via Browser" style="display: flex; align-items: center; gap: 0.4rem;">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print
            </button>
            <button class="btn-reset-filters" onclick="window.SiddhanTech.exportShortlistCSV()">CSV</button>
            <button class="btn-reset-filters" onclick="window.SiddhanTech.exportShortlistJSON()">JSON</button>
            <button class="btn-reset-filters" style="margin-left: auto; color: #f87171;" onclick="window.SiddhanTech.clearBookmarks()">Clear All</button>
          </div>
        `}
      </div>
    `;

    DOM.bookmarksModal.classList.add('active');
  }

  /**
   * Bookmark Toggling
   */
  function toggleBookmark(roleId) {
    if (state.bookmarks.has(roleId)) {
      state.bookmarks.delete(roleId);
      showToast(`Removed ${roleId} from your shortlist`, 'info');
    } else {
      state.bookmarks.add(roleId);
      showToast(`Saved ${roleId} to your SIDDHAN TECHNOLOGIES shortlist!`, 'success');
    }
    localStorage.setItem('siddhan_bookmarks', JSON.stringify(Array.from(state.bookmarks)));
    updateBadges();
    applyFilters();
  }

  function clearBookmarks() {
    state.bookmarks.clear();
    localStorage.removeItem('siddhan_bookmarks');
    localStorage.removeItem('iyal_bookmarks');
    localStorage.removeItem('nexus3d_bookmarks');
    updateBadges();
    applyFilters();
    openBookmarksModal();
    showToast('Cleared all saved bookmarks', 'info');
  }

  /**
   * Compare Toggling
   */
  function toggleCompare(roleId) {
    if (state.compareList.has(roleId)) {
      state.compareList.delete(roleId);
      showToast(`Removed ${roleId} from comparison matrix`, 'info');
    } else {
      if (state.compareList.size >= 3) {
        showToast('You can compare a maximum of 3 roles at a time', 'warning');
        return;
      }
      state.compareList.add(roleId);
      showToast(`Added ${roleId} to role compare!`, 'success');
    }
    localStorage.setItem('siddhan_compare', JSON.stringify(Array.from(state.compareList)));
    updateBadges();
    applyFilters();
  }

  function clearCompare() {
    state.compareList.clear();
    localStorage.removeItem('siddhan_compare');
    localStorage.removeItem('iyal_compare');
    localStorage.removeItem('nexus3d_compare');
    updateBadges();
    renderComparisonView();
    showToast('Comparison matrix cleared', 'info');
  }

  /**
   * Badges Count Updater
   */
  function updateBadges() {
    if (DOM.bookmarkCountBadge) {
      DOM.bookmarkCountBadge.textContent = state.bookmarks.size;
      DOM.bookmarkCountBadge.style.display = state.bookmarks.size > 0 ? 'flex' : 'none';
    }
    if (DOM.mobileSavedBadge) {
      DOM.mobileSavedBadge.textContent = state.bookmarks.size;
      DOM.mobileSavedBadge.style.display = state.bookmarks.size > 0 ? 'inline-block' : 'none';
    }
    if (DOM.compareCountBadge) {
      DOM.compareCountBadge.textContent = state.compareList.size;
      DOM.compareCountBadge.style.display = state.compareList.size > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Modal Close Helper
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  /**
   * View Switcher Handler
   */
  function switchView(viewName) {
    state.activeView = viewName;

    // Toggle desktop nav tab active classes
    DOM.navTabs.forEach(btn => {
      const v = btn.getAttribute('data-view');
      if (v === viewName) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Toggle mobile bottom nav items active classes
    DOM.mobileNavItems.forEach(item => {
      const v = item.getAttribute('data-view');
      if (v === viewName) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Toggle view container visibility
    Object.keys(DOM.views).forEach(key => {
      if (DOM.views[key]) {
        if (key === viewName) {
          DOM.views[key].style.display = 'block';
        } else {
          DOM.views[key].style.display = 'none';
        }
      }
    });

    // Toggle view toggles on controls bar
    DOM.viewToggles.forEach(t => {
      if (t.getAttribute('data-view') === viewName) t.classList.add('active');
      else t.classList.remove('active');
    });

    if (DOM.views[viewName]) {
      const targetY = Math.max(0, DOM.views[viewName].offsetTop - 90);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }

  /**
   * Filter Helpers
   */
  function setSoftwareFilter(swId) {
    state.activeSoftware = swId;
    renderSoftwareFilterStrip();
    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = swId;
    applyFilters();
  }

  function filterByTool(toolName) {
    closeModal('roleModal');
    state.activeSoftware = 'all';
    state.selectedIndustry = 'all';
    state.selectedHub = 'all';
    state.searchQuery = toolName;
    if (DOM.industryFilter) DOM.industryFilter.value = 'all';
    if (DOM.hubFilter) DOM.hubFilter.value = 'all';
    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = 'all';
    if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = 'all';
    if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = 'all';
    if (DOM.searchInput) DOM.searchInput.value = toolName;
    renderSoftwareFilterStrip();
    switchView('cards');
    applyFilters();
    showToast(`Filtering roles using tool: "${toolName}"`, 'info');
  }

  function filterTableByTool(toolName) {
    state.activeSoftware = 'all';
    state.selectedIndustry = 'all';
    state.selectedHub = 'all';
    state.searchQuery = toolName;
    if (DOM.industryFilter) DOM.industryFilter.value = 'all';
    if (DOM.hubFilter) DOM.hubFilter.value = 'all';
    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = 'all';
    if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = 'all';
    if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = 'all';
    if (DOM.searchInput) DOM.searchInput.value = toolName;
    renderSoftwareFilterStrip();
    applyFilters();
    showToast(`Master Table filtered by ${toolName}`, 'info');
  }

  function filterByHub(hubName) {
    closeModal('roleModal');
    state.activeSoftware = 'all';
    state.searchQuery = '';
    state.selectedIndustry = 'all';
    state.selectedHub = hubName;
    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.industryFilter) DOM.industryFilter.value = 'all';
    if (DOM.hubFilter) DOM.hubFilter.value = hubName;
    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = 'all';
    if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = 'all';
    if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = hubName;
    [DOM.hubFilter, DOM.mobileHubSelect].forEach(select => {
      if (!select || Array.from(select.options).some(option => option.value === hubName)) return;
      const option = document.createElement('option');
      option.value = hubName;
      option.textContent = hubName;
      select.appendChild(option);
      select.value = hubName;
    });
    renderSoftwareFilterStrip();
    switchView('cards');
    applyFilters();
    showToast(`Filtered by hub: ${hubName}`, 'info');
  }

  function resetAllFilters() {
    state.activeSoftware = 'all';
    state.searchQuery = '';
    state.selectedIndustry = 'all';
    state.selectedHub = 'all';
    state.sortBy = 'default';

    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.industryFilter) DOM.industryFilter.value = 'all';
    if (DOM.hubFilter) DOM.hubFilter.value = 'all';
    if (DOM.sortSelect) DOM.sortSelect.value = 'default';

    if (DOM.mobileSwSelect) DOM.mobileSwSelect.value = 'all';
    if (DOM.mobileIndSelect) DOM.mobileIndSelect.value = 'all';
    if (DOM.mobileHubSelect) DOM.mobileHubSelect.value = 'all';
    if (DOM.mobileSortSelect) DOM.mobileSortSelect.value = 'id-asc';

    renderSoftwareFilterStrip();
    applyFilters();
    showToast('All filters reset to default', 'info');
  }

  /**
   * PDF Dossier Preview & Generation Engine
   */
  function openPDFPreviewModal(autoDownload = false) {
    const list = Array.from(state.bookmarks).map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);
    if (list.length === 0) {
      showToast('Your shortlist is empty! Bookmark roles before viewing PDF dossier.', 'warning');
      openBookmarksModal();
      return;
    }

    closeModal('bookmarksModal');

    const contentBox = document.getElementById('pdfDossierContent');
    if (contentBox) {
      contentBox.innerHTML = generatePDFReportContentHTML(list);
    }

    const modal = document.getElementById('pdfPreviewModal');
    if (modal) {
      modal.classList.add('active');
    }

    if (autoDownload) {
      setTimeout(() => {
        downloadPDFFromPreview();
      }, 500);
    }
  }

  const SW_RGB = {
    unreal: [2, 132, 199],
    max: [0, 168, 143],
    maya: [5, 150, 105],
    substance: [234, 88, 12],
    marvelous: [225, 29, 72],
    photoshop: [37, 99, 235],
    premiere: [124, 58, 237],
    aftereffects: [147, 51, 234],
    audition: [13, 148, 136],
    resolve: [217, 119, 6],
    nuke: [220, 38, 38]
  };

  function downloadPDFFromPreview() {
    const list = Array.from(state.bookmarks).map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);
    if (list.length === 0) {
      showToast('Your shortlist is empty! Bookmark roles before downloading PDF.', 'warning');
      return;
    }

    showToast('Generating executive vector PDF dossier...', 'info');

    try {
      const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!jsPDFConstructor) {
        throw new Error('jsPDF engine not available');
      }

      const doc = new jsPDFConstructor({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Cover Header on Page 1
      doc.setFillColor(9, 14, 26);
      doc.roundedRect(14, 14, 182, 30, 2.5, 2.5, 'F');

      doc.setFillColor(56, 189, 248);
      doc.roundedRect(14, 14, 3.5, 30, 1.5, 1.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SIDDHAN TECHNOLOGIES', 22, 24);

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('CAREER INTELLIGENCE MATRIX — EXECUTIVE PRODUCTION TALENT DOSSIER', 22, 30);

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7.5);
      doc.text('Phone: +91 96007 47753  •  Email: siddhantechnologies@gmail.com  •  ' + dateStr, 22, 37);

      let y = 50;

      // Section 1: Matrix Table Index
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('1. SHORTLIST MATRIX INDEX (' + list.length + ' ROLES)', 14, y);
      y += 4;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, 182, 7, 'S');

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('SOFTWARE', 17, y + 4.8);
      doc.text('ID', 52, y + 4.8);
      doc.text('JOB ROLE TITLE', 72, y + 4.8);
      doc.text('PRIMARY INDUSTRY', 134, y + 4.8);
      y += 7;

      // Table Rows
      list.forEach((role, idx) => {
        const sw = SOFTWARE_METADATA[role.softwareKey] || { name: role.software };
        const swRgb = SW_RGB[role.softwareKey] || [56, 189, 248];

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 6.5, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, y, 182, 6.5, 'S');

        doc.setTextColor(swRgb[0], swRgb[1], swRgb[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(sw.name, 17, y + 4.5);

        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.text(role.id, 52, y + 4.5);

        doc.setTextColor(15, 23, 42);
        doc.text(role.title.length > 36 ? role.title.slice(0, 34) + '...' : role.title, 72, y + 4.5);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.text(role.industry.length > 28 ? role.industry.slice(0, 26) + '...' : role.industry, 134, y + 4.5);

        y += 6.5;
      });

      y += 8;

      // Section 2: Detailed Role Breakdowns
      if (y > 240) {
        doc.addPage();
        y = 16;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('2. DETAILED ROLE SPECIFICATIONS & PORTFOLIO GUIDELINES', 14, y);
      y += 5;

      list.forEach((role) => {
        const sw = SOFTWARE_METADATA[role.softwareKey] || { name: role.software };
        const swRgb = SW_RGB[role.softwareKey] || [56, 189, 248];

        const respLines = doc.splitTextToSize(role.responsibilities, 168);
        const wfText = role.dayInTheLife || 'Active daily asset creation, review checkpoints, and cross-department pipeline integration.';
        const wfLines = doc.splitTextToSize(wfText, 168);
        const toolsText = 'Companion Tools: ' + role.companionTools.join(', ');
        const toolsLines = doc.splitTextToSize(toolsText, 168);
        const tipLines = role.portfolioTip ? doc.splitTextToSize('Portfolio Guidance: ' + role.portfolioTip, 162) : [];
        const hubsText = 'Key Production Hubs: ' + role.hubs.join(' • ');

        let cardHeight = 22 + (respLines.length * 3.4) + (wfLines.length * 3.4) + (toolsLines.length * 3.4) + 8;
        if (tipLines.length > 0) {
          cardHeight += (tipLines.length * 3.4) + 6;
        }
        cardHeight += 6; // room for hubs line + bottom padding

        if (y + cardHeight > 280) {
          doc.addPage();
          y = 16;
        }

        // Draw Card Box
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(218, 226, 236);
        doc.roundedRect(14, y, 182, cardHeight, 2, 2, 'FD');

        // Color accent strip on left
        doc.setFillColor(swRgb[0], swRgb[1], swRgb[2]);
        doc.roundedRect(14, y, 3.2, cardHeight, 1, 1, 'F');

        // Badges: ID, Software, Demand
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(20, y + 3.2, 16, 4.5, 1, 1, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(role.id, 22, y + 6.5);

        doc.setFillColor(swRgb[0], swRgb[1], swRgb[2]);
        doc.roundedRect(38, y + 3.2, 30, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(sw.name, 40, y + 6.5);

        doc.setFillColor(22, 101, 52);
        doc.circle(73, y + 5.2, 0.9, 'F');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(7);
        doc.text(role.demandLevel + ' Demand', 75.5, y + 6.5);

        // Role Title & Industry
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(role.title, 20, y + 13);

        doc.setTextColor(2, 132, 199);
        doc.setFontSize(8);
        doc.text(role.industry, 20, y + 17.5);

        // Responsibilities
        let curY = y + 21.5;
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text('CORE RESPONSIBILITIES:', 20, curY);
        curY += 3.5;

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(respLines, 20, curY);
        curY += (respLines.length * 3.4) + 2.5;

        // Daily Workflow
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text('PRODUCTION WORKFLOW:', 20, curY);
        curY += 3.5;

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(wfLines, 20, curY);
        curY += (wfLines.length * 3.4) + 2.5;

        // Companion Tools
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(toolsLines, 20, curY);
        curY += (toolsLines.length * 3.4) + 2.5;

        // Portfolio Guidance Box
        if (tipLines.length > 0) {
          const boxH = (tipLines.length * 3.4) + 4;
          doc.setFillColor(240, 253, 244);
          doc.rect(20, curY - 2.5, 170, boxH, 'F');
          doc.setFillColor(34, 197, 94);
          doc.rect(20, curY - 2.5, 1.5, boxH, 'F');

          doc.setTextColor(20, 83, 45);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.text(tipLines, 24, curY + 1);
          curY += boxH + 2;
        }

        // Production Hubs
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text(hubsText, 20, curY + 1.5);

        y += cardHeight + 4.5;
      });

      // Page Footers on all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 287, 196, 287);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text('© 2026 SIDDHAN TECHNOLOGIES • CAREER INTELLIGENCE MATRIX • +91 96007 47753', 14, 291);
        doc.text('Page ' + p + ' of ' + totalPages, 180, 291);
      }

      const fileName = 'SIDDHAN_TECHNOLOGIES_Saved_Roles_' + new Date().toISOString().slice(0, 10) + '.pdf';
      doc.save(fileName);
      showToast('Downloaded vector PDF: ' + fileName, 'success');
    } catch (err) {
      console.warn('Vector PDF generation error, using native print fallback:', err);
      printShortlistPDF();
    }
  }

  function exportShortlistPDF() {
    downloadPDFFromPreview();
  }

  function exportSingleRolePDF(roleId) {
    const role = ROLES_DATA.find(r => r.id === roleId);
    if (!role) {
      showToast('Role specification not found', 'warning');
      return;
    }

    showToast(`Generating ${role.id} vector PDF blueprint...`, 'info');

    try {
      const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!jsPDFConstructor) {
        throw new Error('jsPDF engine not available');
      }

      const doc = new jsPDFConstructor({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const sw = SOFTWARE_METADATA[role.softwareKey] || { name: role.software };
      const swRgb = SW_RGB[role.softwareKey] || [56, 189, 248];

      // Executive Header Banner
      doc.setFillColor(9, 14, 26);
      doc.roundedRect(14, 14, 182, 30, 2.5, 2.5, 'F');

      doc.setFillColor(swRgb[0], swRgb[1], swRgb[2]);
      doc.roundedRect(14, 14, 3.5, 30, 1.5, 1.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SIDDHAN TECHNOLOGIES', 22, 24);

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('CAREER INTELLIGENCE MATRIX — ROLE SPECIFICATION BLUEPRINT', 22, 30);

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(7.5);
      doc.text('Contact: +91 96007 47753  •  Email: siddhantechnologies@gmail.com  •  Role ID: ' + role.id, 22, 37);

      let y = 50;

      // Calculate lines
      const respLines = doc.splitTextToSize(role.responsibilities, 168);
      const wfText = role.dayInTheLife || 'Active daily asset creation, review checkpoints, and cross-department pipeline integration.';
      const wfLines = doc.splitTextToSize(wfText, 168);
      const toolsText = 'Companion Tools: ' + role.companionTools.join(', ');
      const toolsLines = doc.splitTextToSize(toolsText, 168);
      const tipLines = role.portfolioTip ? doc.splitTextToSize('Portfolio Guidance: ' + role.portfolioTip, 162) : [];
      const hubsText = 'Key Production Hubs: ' + role.hubs.join(' • ');

      let cardHeight = 24 + (respLines.length * 3.6) + (wfLines.length * 3.6) + (toolsLines.length * 3.6) + 8;
      if (tipLines.length > 0) {
        cardHeight += (tipLines.length * 3.6) + 7;
      }
      cardHeight += 7;

      // Draw Card Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(218, 226, 236);
      doc.roundedRect(14, y, 182, cardHeight, 2, 2, 'FD');

      // Left Accent Strip
      doc.setFillColor(swRgb[0], swRgb[1], swRgb[2]);
      doc.roundedRect(14, y, 3.2, cardHeight, 1, 1, 'F');

      // Badges: ID, Software, Demand
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(20, y + 3.5, 16, 5, 1, 1, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(role.id, 22, y + 7);

      doc.setFillColor(swRgb[0], swRgb[1], swRgb[2]);
      doc.roundedRect(38, y + 3.5, 30, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(sw.name, 40, y + 7);

      doc.setFillColor(22, 101, 52);
      doc.circle(73, y + 5.7, 1, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(7.5);
      doc.text(role.demandLevel + ' Demand', 75.5, y + 7);

      // Title & Industry
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(role.title, 20, y + 15);

      doc.setTextColor(2, 132, 199);
      doc.setFontSize(8.5);
      doc.text(role.industry, 20, y + 20);

      // Responsibilities
      let curY = y + 24.5;
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('CORE RESPONSIBILITIES:', 20, curY);
      curY += 3.8;

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(respLines, 20, curY);
      curY += (respLines.length * 3.6) + 3;

      // Daily Workflow
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('PRODUCTION WORKFLOW:', 20, curY);
      curY += 3.8;

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(wfLines, 20, curY);
      curY += (wfLines.length * 3.6) + 3;

      // Companion Tools
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(toolsLines, 20, curY);
      curY += (toolsLines.length * 3.6) + 3;

      // Portfolio Guidance Box
      if (tipLines.length > 0) {
        const boxH = (tipLines.length * 3.6) + 5;
        doc.setFillColor(240, 253, 244);
        doc.rect(20, curY - 2.5, 170, boxH, 'F');
        doc.setFillColor(34, 197, 94);
        doc.rect(20, curY - 2.5, 1.5, boxH, 'F');

        doc.setTextColor(20, 83, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(tipLines, 24, curY + 1.5);
        curY += boxH + 3;
      }

      // Production Hubs
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(hubsText, 20, curY + 2);

      // Studio Standards Callout
      const pipelineY = y + cardHeight + 6;
      if (pipelineY < 265) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, pipelineY, 182, 16, 2, 2, 'FD');

        doc.setTextColor(99, 102, 241);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('STUDIO PRODUCTION STANDARDS ALIGNED', 20, pipelineY + 5.5);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('This role specification adheres to premier studio benchmarks across Gaming, Film VFX, and Creative Post-Production.', 20, pipelineY + 11);
      }

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 287, 196, 287);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text('© 2026 SIDDHAN TECHNOLOGIES • CAREER INTELLIGENCE MATRIX • ' + role.id + ' Blueprint • +91 96007 47753', 14, 291);

      const fileName = `SIDDHAN_Tech_${role.id}_${role.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);
      showToast(`Downloaded ${role.id} PDF Blueprint!`, 'success');
    } catch (err) {
      console.warn('Single role PDF generation error:', err);
      showToast('Error generating PDF blueprint', 'error');
    }
  }

  function printShortlistPDF() {
    const list = Array.from(state.bookmarks).map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);
    if (list.length === 0) {
      showToast('Your shortlist is empty! Bookmark roles before printing PDF.', 'warning');
      openBookmarksModal();
      return;
    }

    const previewModal = document.getElementById('pdfPreviewModal');
    if (previewModal && previewModal.classList.contains('active')) {
      window.print();
      return;
    }

    const reportHTML = generatePDFReportHTML(list);
    openNativePrintWindow(reportHTML);
  }

  function openNativePrintWindow(htmlContent) {
    const printWindow = window.open('', '_blank', 'width=1000,height=850,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
      showToast('Print preview ready. Select "Save as PDF" to save your file!', 'success');
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }, 15000);
      }, 400);
      showToast('Print dialog launched. Select "Save as PDF" to save file!', 'success');
    }
  }

  function generatePDFReportContentHTML(roles) {
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const swMap = {};
    roles.forEach(r => {
      const swName = (SOFTWARE_METADATA[r.softwareKey] && SOFTWARE_METADATA[r.softwareKey].name) || r.software;
      swMap[swName] = (swMap[swName] || 0) + 1;
    });
    const swSummary = Object.entries(swMap).map(([k, v]) => `${k} (${v})`).join(' • ');

    return `
      <div class="pdf-dossier-banner">
        <div class="pdf-dossier-brand">SIDDHAN <span>TECHNOLOGIES</span></div>
        <div class="pdf-dossier-sub">CAREER INTELLIGENCE MATRIX — Executive Talent Dossier</div>
        <div class="pdf-dossier-meta">
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Phone:</strong> +91 96007 47753</div>
          <div><strong>Email:</strong> siddhantechnologies@gmail.com</div>
          <div><strong>Roles:</strong> ${roles.length}</div>
          <div><strong>Suites:</strong> ${swSummary}</div>
        </div>
      </div>

      <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem; margin-bottom: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: space-between;">
        <span>1. Shortlist Matrix Index</span>
        <span style="font-size: 0.75rem; font-weight: normal; color: #64748b;">${roles.length} Roles Selected</span>
      </div>

      <div class="pdf-table-wrap">
        <table class="pdf-summary-table">
          <thead>
            <tr>
              <th style="width: 14%;">Software</th>
              <th style="width: 12%;">ID</th>
              <th style="width: 28%;">Role Title</th>
              <th style="width: 22%;">Primary Industry</th>
              <th style="width: 24%;">Production Hubs</th>
            </tr>
          </thead>
          <tbody>
            ${roles.map(r => {
              const sw = SOFTWARE_METADATA[r.softwareKey] || { name: r.software, color: '#475569' };
              return `
                <tr>
                  <td><span style="font-weight: 700; color: ${sw.color};">${sw.name}</span></td>
                  <td><code>${r.id}</code></td>
                  <td><strong>${r.title}</strong></td>
                  <td>${r.industry}</td>
                  <td>${r.hubs.slice(0, 3).join(', ')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem; margin: 1.5rem 0 1rem; text-transform: uppercase; letter-spacing: 0.5px;">
        2. Detailed Role Specifications
      </div>

      <div>
        ${roles.map(role => {
          const sw = SOFTWARE_METADATA[role.softwareKey] || { name: role.software, color: '#38bdf8' };
          return `
            <div class="pdf-role-card" style="border-left: 5px solid ${sw.color};">
              <div class="pdf-role-top">
                <div>
                  <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.25rem;">
                    <span style="font-family: monospace; font-size: 0.72rem; font-weight: 700; background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px;">${role.id}</span>
                    <span style="font-size: 0.72rem; font-weight: 700; background: ${sw.color}; color: #ffffff; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">${sw.name}</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #166534; background: #dcfce7; padding: 2px 7px; border-radius: 4px;">● ${role.demandLevel} Demand</span>
                  </div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; line-height: 1.25;">${role.title}</div>
                  <div style="font-size: 0.8rem; font-weight: 600; color: #0284c7; margin-top: 0.15rem;">${role.industry}</div>
                </div>
              </div>

              <div class="pdf-field">
                <div class="pdf-field-label">Core Industry Responsibilities</div>
                <div class="pdf-field-val">${role.responsibilities}</div>
              </div>

              <div class="pdf-field">
                <div class="pdf-field-label">Day-in-the-Life & Production Workflow</div>
                <div class="pdf-field-val">${role.dayInTheLife || 'Active daily asset creation, review checkpoints, and cross-department pipeline integration.'}</div>
              </div>

              <div class="pdf-field">
                <div class="pdf-field-label">Companion Software & Synergy Stack</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.25rem;">
                  ${role.companionTools.map(t => `<span style="font-size: 0.72rem; font-weight: 600; background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 3px; border: 1px solid #e2e8f0;">${t}</span>`).join('')}
                </div>
              </div>

              ${role.portfolioTip ? `
                <div class="pdf-portfolio-callout">
                  <strong style="color: #14532d;">Portfolio & Hiring Tip:</strong> ${role.portfolioTip}
                </div>
              ` : ''}

              <div class="pdf-field" style="margin-top: 0.65rem;">
                <div class="pdf-field-label">Key Production Hubs</div>
                <div class="pdf-field-val" style="color: #475569; font-size: 0.8rem;">${role.hubs.join(' • ')}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 1.75rem; padding-top: 0.9rem; border-top: 1px solid #cbd5e1; font-size: 0.75rem; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
        <div>&copy; 2026 SIDDHAN TECHNOLOGIES. All Rights Reserved. Curated for Artists, TDs & Production Studios.</div>
        <div>Confidential Talent Roadmap</div>
      </div>
    `;
  }

  function generatePDFReportHTML(roles) {
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const swMap = {};
    roles.forEach(r => {
      const swName = (SOFTWARE_METADATA[r.softwareKey] && SOFTWARE_METADATA[r.softwareKey].name) || r.software;
      swMap[swName] = (swMap[swName] || 0) + 1;
    });
    const swSummary = Object.entries(swMap).map(([k, v]) => `${k} (${v})`).join(' • ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SIDDHAN TECHNOLOGIES - Saved Career Roles Dossier</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 12mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 10.5pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pdf-container {
      max-width: 100%;
      margin: 0 auto;
      padding: 10px;
    }
    .header-banner {
      background: linear-gradient(135deg, #090e1a 0%, #17223b 100%);
      color: #ffffff;
      padding: 22px 26px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 6px solid #38bdf8;
    }
    .brand-title {
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin-bottom: 3px;
    }
    .brand-title span {
      color: #38bdf8;
    }
    .brand-subtitle {
      font-size: 9.5pt;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .meta-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 8.8pt;
      color: #cbd5e1;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }
    .meta-item strong {
      color: #ffffff;
    }
    .section-heading {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 20px 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      font-size: 9pt;
    }
    .summary-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border: 1px solid #cbd5e1;
    }
    .summary-table td {
      padding: 7px 9px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .summary-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .role-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .role-badges {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 4px;
    }
    .sw-badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .id-badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #334155;
    }
    .demand-badge {
      font-size: 7.5pt;
      font-weight: 700;
      color: #166534;
      background: #dcfce7;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .role-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
    }
    .role-industry {
      font-size: 8.8pt;
      font-weight: 600;
      color: #0284c7;
      margin-top: 2px;
    }
    .role-field {
      margin-top: 8px;
    }
    .field-label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .field-text {
      font-size: 9pt;
      color: #1e293b;
      line-height: 1.4;
    }
    .tools-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
    }
    .tool-chip {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 600;
      background: #f1f5f9;
      color: #334155;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    .portfolio-callout {
      background: #f0fdf4;
      border-left: 3px solid #22c55e;
      padding: 7px 10px;
      border-radius: 0 4px 4px 0;
      margin-top: 8px;
      font-size: 8.8pt;
      color: #166534;
    }
    .portfolio-callout strong {
      color: #14532d;
    }
    .footer-notice {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    <div class="header-banner">
      <div class="brand-title">SIDDHAN <span>TECHNOLOGIES</span></div>
      <div class="brand-subtitle">CAREER INTELLIGENCE MATRIX — Executive Career Dossier &amp; Production Talent Blueprint</div>
      <div class="meta-grid">
        <div class="meta-item"><strong>Date:</strong> ${dateStr}</div>
        <div class="meta-item"><strong>Phone:</strong> +91 96007 47753</div>
        <div class="meta-item"><strong>Email:</strong> siddhantechnologies@gmail.com</div>
        <div class="meta-item"><strong>Saved Roles:</strong> ${roles.length}</div>
        <div class="meta-item"><strong>Software Coverage:</strong> ${swSummary}</div>
      </div>
    </div>

    <div class="section-heading">
      <span>1. Shortlist Matrix Index</span>
      <span style="font-size: 8.5pt; font-weight: normal; color: #64748b;">${roles.length} Roles Selected</span>
    </div>

    <table class="summary-table">
      <thead>
        <tr>
          <th style="width: 14%;">Software</th>
          <th style="width: 12%;">ID</th>
          <th style="width: 28%;">Role Title</th>
          <th style="width: 22%;">Primary Industry</th>
          <th style="width: 24%;">Production Hubs</th>
        </tr>
      </thead>
      <tbody>
        ${roles.map(r => {
          const sw = SOFTWARE_METADATA[r.softwareKey] || { name: r.software, color: '#475569' };
          return `
            <tr>
              <td><span style="font-weight: 700; color: ${sw.color};">${sw.name}</span></td>
              <td><code>${r.id}</code></td>
              <td><strong>${r.title}</strong></td>
              <td>${r.industry}</td>
              <td>${r.hubs.slice(0, 3).join(', ')}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="section-heading">
      <span>2. Detailed Role Specifications</span>
      <span style="font-size: 8.5pt; font-weight: normal; color: #64748b;">Production Duties & Portfolio Guidelines</span>
    </div>

    <div class="role-cards-container">
      ${roles.map(role => {
        const sw = SOFTWARE_METADATA[role.softwareKey] || { name: role.software, color: '#38bdf8' };
        return `
          <div class="role-card" style="border-left: 4px solid ${sw.color};">
            <div class="role-header">
              <div>
                <div class="role-badges">
                  <span class="id-badge">${role.id}</span>
                  <span class="sw-badge" style="background: ${sw.color};">${sw.name}</span>
                  <span class="demand-badge">● ${role.demandLevel} Demand</span>
                </div>
                <div class="role-title">${role.title}</div>
                <div class="role-industry">${role.industry}</div>
              </div>
            </div>

            <div class="role-field">
              <div class="field-label">Core Industry Responsibilities</div>
              <div class="field-text">${role.responsibilities}</div>
            </div>

            <div class="role-field">
              <div class="field-label">Day-in-the-Life & Production Workflow</div>
              <div class="field-text">${role.dayInTheLife || 'Active daily asset creation, review checkpoints, and cross-department pipeline integration.'}</div>
            </div>

            <div class="role-field">
              <div class="field-label">Companion Software & Synergy Stack</div>
              <div class="tools-list">
                ${role.companionTools.map(t => `<span class="tool-chip">${t}</span>`).join('')}
              </div>
            </div>

            ${role.portfolioTip ? `
              <div class="portfolio-callout">
                <strong>Portfolio & Hiring Tip:</strong> ${role.portfolioTip}
              </div>
            ` : ''}

            <div class="role-field" style="margin-top: 8px;">
              <div class="field-label">Key Production Hubs</div>
              <div class="field-text" style="color: #475569; font-size: 8.5pt;">${role.hubs.join(' • ')}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="footer-notice">
      <div>&copy; 2026 SIDDHAN TECHNOLOGIES. All Rights Reserved. Curated for Artists, TDs & Production Studios.</div>
      <div>Confidential Talent Roadmap</div>
    </div>
  </div>
</body>
</html>`;
  }

  function exportShortlistCSV() {
    const list = Array.from(state.bookmarks).map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);
    if (list.length === 0) return;

    let csv = "Role ID,Software,Job Role,Primary Industry,Core Responsibilities,Companion Tools,High-Demand Hubs\n";
    list.forEach(r => {
      csv += `"${r.id}","${r.software}","${r.title}","${r.industry}","${r.responsibilities.replace(/"/g, '""')}","${r.companionTools.join(', ')}","${r.hubs.join(', ')}"\n`;
    });

    downloadFile(csv, 'SIDDHAN_Technologies_Career_Shortlist.csv', 'text/csv;charset=utf-8;');
    showToast('Downloaded career shortlist CSV!', 'success');
  }

  function exportShortlistJSON() {
    const list = Array.from(state.bookmarks).map(id => ROLES_DATA.find(r => r.id === id)).filter(Boolean);
    const jsonStr = JSON.stringify(list, null, 2);
    downloadFile(jsonStr, 'SIDDHAN_Technologies_Career_Shortlist.json', 'application/json');
    showToast('Downloaded career shortlist JSON!', 'success');
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyRoleShareText(roleId) {
    const role = ROLES_DATA.find(r => r.id === roleId);
    if (!role) return;

    const text = `SIDDHAN TECHNOLOGIES | CAREER INTELLIGENCE MATRIX
Role: ${role.title} (${role.id})
Software Suite: ${role.software}
Primary Industry: ${role.industry}
Key Responsibilities: ${role.responsibilities}
Daily Workflow: ${role.dayInTheLife || 'Active production asset authoring, milestone reviews and pipeline delivery.'}
Companion Tools: ${role.companionTools.join(', ')}
Key Production Hubs: ${role.hubs.join(', ')}
Official Contact: +91 96007 47753 | siddhantechnologies@gmail.com`;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${role.id} specification to clipboard!`, 'success');
    });
  }

  /**
   * Toast Notifications
   */
  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    if (type === 'success') {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#22c55e" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /**
   * Escape quotes helper
   */
  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
  }

  /**
   * Event Listeners Binding
   */
  function bindEvents() {
    // Make the open area of each Career card behave like a Course card while
    // leaving its title, software chips, and action buttons independent.
    if (DOM.rolesGrid) {
      DOM.rolesGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.role-card[data-role-id]');
        if (!card || !DOM.rolesGrid.contains(card)) return;
        if (event.target.closest('a, button, input, select, textarea, .tool-tag')) return;
        openRoleModal(card.dataset.roleId);
      });

      DOM.rolesGrid.addEventListener('keydown', (event) => {
        const card = event.target.closest('.role-card[data-role-id]');
        if (!card || event.target !== card || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        openRoleModal(card.dataset.roleId);
      });
    }

    // Search input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (state.activeView !== 'cards' && state.activeView !== 'table') {
          switchView('cards');
        }
        applyFilters();
      });
    }

    if (DOM.searchClearBtn) {
      DOM.searchClearBtn.addEventListener('click', () => {
        state.searchQuery = '';
        DOM.searchInput.value = '';
        DOM.searchInput.focus();
        if (state.activeView !== 'cards' && state.activeView !== 'table') {
          switchView('cards');
        }
        applyFilters();
      });
    }

    // Dropdowns
    if (DOM.industryFilter) {
      DOM.industryFilter.addEventListener('change', (e) => {
        state.selectedIndustry = e.target.value;
        if (state.activeView !== 'cards' && state.activeView !== 'table') {
          switchView('cards');
        }
        applyFilters();
      });
    }

    if (DOM.hubFilter) {
      DOM.hubFilter.addEventListener('change', (e) => {
        state.selectedHub = e.target.value;
        if (state.activeView !== 'cards' && state.activeView !== 'table') {
          switchView('cards');
        }
        applyFilters();
      });
    }

    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
      });
    }

    if (DOM.resetFiltersBtn) {
      DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Nav Tabs
    DOM.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-view');
        switchView(view);
      });
    });

    // View Toggles
    DOM.viewToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    // Theme Toggle
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Contact Enquiry Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const values = new FormData(contactForm);
        const body = [
          `Name: ${values.get('name') || ''}`,
          `Phone: ${values.get('phone') || 'Not provided'}`,
          `Email: ${values.get('email') || ''}`,
          `Course of Interest: ${values.get('course') || 'Not selected'}`,
          '',
          'Message:',
          values.get('message') || ''
        ].join('\n');
        const subject = `Career enquiry from ${values.get('name') || 'website visitor'}`;
        window.location.href = `mailto:siddhantechnologies@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        showToast('Your email app will open with the enquiry. Send the email to complete it.', 'info');
      });
    }
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput.focus();
      }
      if (e.key === 'Escape') {
        closeModal('roleModal');
        closeModal('bookmarksModal');
        closeModal('wizardModal');
        closeModal('mobileFilterModal');
        closeModal('pdfPreviewModal');
      }
    });

    // Click outside modal dialog to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });
  }

  // Expose Global Public API for SIDDHAN TECHNOLOGIES
  window.SiddhanTech = {
    openRoleModal,
    closeModal,
    toggleBookmark,
    toggleCompare,
    clearCompare,
    clearBookmarks,
    openBookmarksModal,
    openCareerWizard,
    openMobileFilterModal,
    applyMobileFilters,
    setWizardAnswer,
    exportShortlistCSV,
    exportShortlistJSON,
    exportShortlistPDF,
    exportSingleRolePDF,
    printShortlistPDF,
    openPDFPreviewModal,
    downloadPDFFromPreview,
    generatePDFReportHTML,
    copyRoleShareText,
    filterByTool,
    filterTableByTool,
    filterByHub,
    switchView,
    resetAllFilters,
    initDynamicPortalLinks
  };

  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'siddhan-portal-filter-hub') return;
    const hubName = String(event.data.hubName || '').trim();
    if (hubName) filterByHub(hubName);
  });

  // Backwards compatibility aliases
  window.IyalStudios = window.SiddhanTech;
  window.Nexus3D = window.SiddhanTech;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
