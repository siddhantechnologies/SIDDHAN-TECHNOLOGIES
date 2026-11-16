// =============================================
// THEME TOGGLE
// =============================================
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

themeBtn?.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  if (window.SiddhanTheme) window.SiddhanTheme.set(nextTheme);
  else html.setAttribute('data-theme', nextTheme);
  showToast(isDark ? '☀️ Light mode on' : '🌙 Dark mode on');
});

// =============================================
// HAMBURGER / MOBILE NAV
// =============================================
// Hamburger replaced with unified mobile-bottom-nav
const mobileNav = document.getElementById('mobileNav');
mobileNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// =============================================
// VIEW SWITCHING (HEADER TABS)
// =============================================
const viewTabs = document.querySelectorAll('.view-tab');
const views = {
  cards: document.getElementById('viewCards'),
  table: document.getElementById('viewTable'),
  analytics: document.getElementById('viewAnalytics'),
  domains: document.getElementById('viewDomains'),
  compare: document.getElementById('viewCompare'),
};
let activeViewName = 'cards';

function switchView(viewName) {
  activeViewName = viewName;
  document.body.dataset.activeView = viewName;
  viewTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.view === viewName);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(m => {
    m.classList.toggle('active', m.dataset.view === viewName);
  });
  Object.values(views).forEach(v => { if (v) v.classList.remove('active'); });
  const target = views[viewName];
  if (target) {
    target.classList.add('active');
    if (viewName === 'analytics') animateBars();
    if (viewName === 'compare') renderCourseCompareView();
  }
  const viewToggle = document.querySelector('.view-toggle');
  if (viewToggle) viewToggle.hidden = viewName !== 'cards';
}
window.switchView = switchView;

viewTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const v = tab.dataset.view;
    switchView(v);
    showToast(`Switched to ${tab.textContent.trim()} view`);
  });
});

// =============================================
// SOFTWARE PILL FILTER
// =============================================
const swPills = document.querySelectorAll('.sw-pill');
const cards = document.querySelectorAll('.role-card');
const tableRows = document.querySelectorAll('.master-table tbody tr');
const resultCount = document.getElementById('resultCount');
const noResults = document.getElementById('noResults');
const industryFilter = document.getElementById('industryFilter');
const hubFilter = document.getElementById('hubFilter');
const savedCourseCount = document.getElementById('savedCourseCount');
const savedCoursesModal = document.getElementById('savedCoursesModal');
const savedCoursesModalCount = document.getElementById('savedCoursesModalCount');
const savedCoursesList = document.getElementById('savedCoursesList');
const savedCoursesPdfBtn = document.getElementById('savedCoursesPdfBtn');
const savedCoursesPrintBtn = document.getElementById('savedCoursesPrintBtn');
const savedCoursesCsvBtn = document.getElementById('savedCoursesCsvBtn');
const savedCoursesJsonBtn = document.getElementById('savedCoursesJsonBtn');
const savedCoursesClearBtn = document.getElementById('savedCoursesClearBtn');
const savedCourseNavCount = document.getElementById('savedCourseNavCount');
const mobileSavedCourseNavCount = document.getElementById('mobileSavedCourseNavCount');
const courseCompareNavCount = document.getElementById('courseCompareNavCount');
const courseCompareContainer = document.getElementById('courseCompareContainer');
const savedCoursesKey = 'siddhan_course_matrix_saved_v1';
const compareCoursesKey = 'siddhan_course_matrix_compare_v1';

function loadSavedCourseCodes() {
  try {
    const saved = JSON.parse(localStorage.getItem(savedCoursesKey) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter(code => typeof code === 'string') : []);
  } catch (error) {
    return new Set();
  }
}

let savedCourseCodes = loadSavedCourseCodes();

function loadCompareCourseCodes() {
  try {
    const compared = JSON.parse(localStorage.getItem(compareCoursesKey) || '[]');
    return new Set(Array.isArray(compared) ? compared.filter(code => typeof code === 'string') : []);
  } catch (error) {
    return new Set();
  }
}

let compareCourseCodes = loadCompareCourseCodes();

function getCardCourseCode(card) {
  return card.querySelector('.role-id-badge')?.textContent.trim() || '';
}

function normalizeCourseTitle(title) {
  return (title || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();
}

function getTableCourseCode(row) {
  const cells = row.querySelectorAll('td');
  const tableCode = cells[0]?.textContent.trim() || '';
  const matchingCode = Array.from(cards).find(card => getCardCourseCode(card) === tableCode);
  if (matchingCode) return tableCode;

  const tableTitle = normalizeCourseTitle(cells[2]?.textContent || '');
  const matchingTitle = Array.from(cards).find(card =>
    normalizeCourseTitle(card.querySelector('.role-title')?.textContent || '') === tableTitle
  );
  return matchingTitle ? getCardCourseCode(matchingTitle) : tableCode;
}

function getTableCourseFamily(row) {
  const suite = row.querySelector('.suite-chip')?.textContent.toLowerCase() || '';
  if (suite.includes('3d')) return '3danim';
  if (/(vfx|motion|video|editing|post)/.test(suite)) return 'vfx';
  return 'graphic';
}

function getCourseIndustries(card) {
  return (card.querySelector('.role-industries')?.textContent || '')
    .split('·')
    .map(industry => industry.trim())
    .filter(Boolean);
}

const courseHubOrder = ['Bengaluru', 'Mumbai', 'Chennai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Kochi', 'Mohali', 'Gurugram', 'Remote'];

function normalizeCourseHub(hub) {
  const normalizedHub = String(hub || '').trim().toLowerCase();
  if (/remote|global/.test(normalizedHub)) return 'Remote';
  return courseHubOrder.find(city => normalizedHub.includes(city.toLowerCase())) || '';
}

function getCourseHubs(card) {
  return Array.from(new Set(
    (card.dataset.hubs || '')
      .split('|')
      .map(normalizeCourseHub)
      .filter(Boolean)
  ));
}

function populateCourseFilterOptions() {
  const industries = new Set();
  const hubs = new Set();
  cards.forEach(card => {
    getCourseIndustries(card).forEach(industry => industries.add(industry));
    getCourseHubs(card).forEach(hub => hubs.add(hub));
  });

  const setOptions = (select, defaultLabel, options) => {
    if (!select) return;
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultLabel;
    select.replaceChildren(defaultOption);
    Array.from(options).sort((a, b) => a.localeCompare(b)).forEach(label => {
      const option = document.createElement('option');
      option.value = label;
      option.textContent = label;
      select.appendChild(option);
    });
  };

  setOptions(industryFilter, 'All Industries', industries);
  setOptions(hubFilter, 'All Production Hubs', Array.from(hubs).sort((a, b) =>
    courseHubOrder.indexOf(a) - courseHubOrder.indexOf(b)
  ));
}

populateCourseFilterOptions();

let selectedIndustry = 'all';
let selectedHub = 'all';

function handleCourseCoverageFilterChange() {
  selectedIndustry = industryFilter?.value || 'all';
  selectedHub = hubFilter?.value || 'all';
  if (!views.cards?.classList.contains('active') && !views.table?.classList.contains('active')) {
    switchView('cards');
  }
  applyFilters();
}

industryFilter?.addEventListener('change', handleCourseCoverageFilterChange);
hubFilter?.addEventListener('change', handleCourseCoverageFilterChange);

function updateSavedCourseUI() {
  if (savedCourseCount) savedCourseCount.textContent = String(savedCourseCodes.size);
  if (savedCourseNavCount) {
    savedCourseNavCount.textContent = String(savedCourseCodes.size);
    savedCourseNavCount.style.display = savedCourseCodes.size ? 'flex' : 'none';
  }
  if (mobileSavedCourseNavCount) {
    mobileSavedCourseNavCount.textContent = String(savedCourseCodes.size);
    mobileSavedCourseNavCount.style.display = savedCourseCodes.size ? 'flex' : 'none';
  }
  if (courseCompareNavCount) {
    courseCompareNavCount.textContent = String(compareCourseCodes.size);
    courseCompareNavCount.style.display = compareCourseCodes.size ? 'flex' : 'none';
  }

  document.querySelectorAll('.save-course-btn, .table-save-btn').forEach(button => {
    const saved = savedCourseCodes.has(button.dataset.courseCode);
    const code = button.dataset.courseCode || '';
    button.classList.toggle('active-bookmark', saved);
    button.title = saved ? 'Remove Bookmark' : 'Save to Shortlist';
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remove bookmark for' : 'Save to shortlist'} ${code}`);
    button.querySelector('svg')?.setAttribute('fill', saved ? 'currentColor' : 'none');
  });

  document.querySelectorAll('.compare-course-btn, .table-compare-btn').forEach(button => {
    const compared = compareCourseCodes.has(button.dataset.courseCode);
    const code = button.dataset.courseCode || '';
    button.classList.toggle('active-compare', compared);
    button.title = compared ? 'Remove from comparison' : 'Compare this course';
    button.setAttribute('aria-pressed', String(compared));
    button.setAttribute('aria-label', `${compared ? 'Remove from comparison' : 'Add to comparison'} ${code}`);
  });

  if (modalBookmarkBtn) {
    const saved = Boolean(currentCourse && savedCourseCodes.has(currentCourse.code));
    modalBookmarkBtn.classList.toggle('active', saved);
    modalBookmarkBtn.setAttribute('aria-pressed', String(saved));
    modalBookmarkBtn.title = saved ? 'Remove from Saved Courses' : 'Save Course';
    modalBookmarkBtn.setAttribute('aria-label', modalBookmarkBtn.title);
  }
}

function toggleSavedCourse(code) {
  if (!code) return;
  const isSaving = !savedCourseCodes.has(code);
  if (isSaving) savedCourseCodes.add(code);
  else savedCourseCodes.delete(code);

  try {
    localStorage.setItem(savedCoursesKey, JSON.stringify(Array.from(savedCourseCodes)));
  } catch (error) {
    // Keep the selection for this session if browser storage is unavailable.
  }

  updateSavedCourseUI();
  applyFilters();
  if (savedCoursesModal?.classList.contains('open')) renderSavedCoursesModal();
  showToast(isSaving ? '✓ Course saved to your list' : 'Course removed from your saved list');
}

function toggleCourseCompare(code) {
  if (!code) return;
  const isCompared = !compareCourseCodes.has(code);
  if (isCompared) {
    if (compareCourseCodes.size >= 3) {
      showToast('Compare up to three courses at a time.');
      return;
    }
    compareCourseCodes.add(code);
  } else {
    compareCourseCodes.delete(code);
  }

  try {
    localStorage.setItem(compareCoursesKey, JSON.stringify(Array.from(compareCourseCodes)));
  } catch (error) {
    // Keep the selection for this session if browser storage is unavailable.
  }

  updateSavedCourseUI();
  if (views.compare?.classList.contains('active')) renderCourseCompareView();
  showToast(isCompared ? 'Course added to comparison' : 'Course removed from comparison');
}

function renderSavedCoursesModal() {
  if (!savedCoursesList) return;

  const savedCards = Array.from(cards).filter(card => savedCourseCodes.has(getCardCourseCode(card)));
  const isEmpty = savedCards.length === 0;
  [savedCoursesPdfBtn, savedCoursesPrintBtn, savedCoursesCsvBtn, savedCoursesJsonBtn, savedCoursesClearBtn]
    .forEach(button => { if (button) button.disabled = isEmpty; });
  if (savedCoursesModalCount) {
    const count = savedCards.length;
    savedCoursesModalCount.textContent = `Saved Courses Shortlist (${count})`;
  }
  savedCoursesList.replaceChildren();

  if (!savedCards.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'saved-courses-empty';

    const icon = document.createElement('span');
    icon.className = 'saved-courses-empty-icon';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.7" fill="none" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';

    const title = document.createElement('h3');
    title.textContent = 'Your shortlist is empty';
    const description = document.createElement('p');
    description.textContent = 'Save a course with its bookmark button and it will appear here.';
    const browseButton = document.createElement('button');
    browseButton.className = 'shortlist-view-btn';
    browseButton.type = 'button';
    browseButton.textContent = 'Browse all courses';
    browseButton.addEventListener('click', () => {
      closeSavedCourses();
      switchView('cards');
      activeFamily = 'all';
      swPills.forEach(pill => {
        const isAllCourses = pill.dataset.filter === 'all';
        pill.classList.toggle('active', isAllCourses);
        pill.setAttribute('aria-pressed', String(isAllCourses));
      });
      applyFilters();
      document.getElementById('filterStrip')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    emptyState.append(icon, title, description, browseButton);
    savedCoursesList.appendChild(emptyState);
    return;
  }

  savedCards.forEach(card => {
    const course = extractCardData(card);
    const row = document.createElement('article');
    row.className = 'saved-course-row';

    const details = document.createElement('div');
    details.className = 'saved-course-details';
    const badges = document.createElement('div');
    badges.className = 'saved-course-badges';
    const code = document.createElement('span');
    code.className = 'saved-course-code';
    code.textContent = course.code;
    const family = document.createElement('span');
    family.className = 'saved-course-family';
    family.textContent = course.suite;
    badges.append(code, family);

    const title = document.createElement('h3');
    title.textContent = course.title;
    const meta = document.createElement('p');
    meta.className = 'saved-course-industries';
    meta.textContent = course.industries;
    details.append(badges, title, meta);

    const actions = document.createElement('div');
    actions.className = 'saved-course-actions';
    const viewButton = document.createElement('button');
    viewButton.className = 'shortlist-view-btn';
    viewButton.type = 'button';
    viewButton.textContent = 'View';
    viewButton.addEventListener('click', () => {
      closeSavedCourses();
      openCourseModal(course);
    });
    const removeButton = document.createElement('button');
    removeButton.className = 'shortlist-remove-btn';
    removeButton.type = 'button';
    removeButton.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    removeButton.title = 'Remove course';
    removeButton.setAttribute('aria-label', `Remove ${course.title} from shortlist`);
    removeButton.addEventListener('click', () => toggleSavedCourse(course.code));
    actions.append(viewButton, removeButton);

    row.append(details, actions);
    savedCoursesList.appendChild(row);
  });
}

function openSavedCourses() {
  renderSavedCoursesModal();
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mobileAction === 'saved');
  });
  savedCoursesModal?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openCourseCompare() {
  switchView('compare');
}

function renderCourseCompareView() {
  if (!courseCompareContainer) return;
  courseCompareContainer.replaceChildren();

  const comparedCards = Array.from(cards).filter(card => compareCourseCodes.has(getCardCourseCode(card)));
  const courses = comparedCards.map(extractCardData);

  if (courses.length < 2) {
    const empty = document.createElement('div');
    empty.className = 'course-compare-empty';
    const icon = document.createElement('span');
    icon.className = 'course-compare-empty-icon';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" stroke-width="1.5" fill="none" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
    const title = document.createElement('h2');
    title.textContent = courses.length ? 'Select one more course to compare' : 'No courses selected for comparison';
    const description = document.createElement('p');
    description.textContent = 'Use the compare icon on course cards or Master Table rows to compare up to three courses side by side.';
    const browseButton = document.createElement('button');
    browseButton.className = 'btn-primary-action';
    browseButton.type = 'button';
    browseButton.textContent = 'Browse Courses';
    browseButton.addEventListener('click', () => switchView('cards'));
    empty.append(icon, title, description, browseButton);
    courseCompareContainer.appendChild(empty);
    return;
  }

  const header = document.createElement('div');
  header.className = 'course-compare-view-header';
  const titleBlock = document.createElement('div');
  const eyebrow = document.createElement('div');
  eyebrow.className = 'saved-courses-eyebrow';
  eyebrow.textContent = 'SIDDHAN TECHNOLOGIES · COURSE MATRIX';
  const title = document.createElement('h2');
  title.textContent = 'Side-by-Side Course Matrix';
  const description = document.createElement('p');
  description.textContent = `Comparing ${courses.length} of 3 maximum courses`;
  titleBlock.append(eyebrow, title, description);

  const clearButton = document.createElement('button');
  clearButton.className = 'course-compare-clear';
  clearButton.type = 'button';
  clearButton.textContent = 'Clear Comparison';
  clearButton.addEventListener('click', clearCourseCompare);
  header.append(titleBlock, clearButton);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'course-compare-table-wrap';
  const table = document.createElement('table');
  table.className = 'course-compare-table';
  table.setAttribute('aria-label', 'Side-by-side course comparison');
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  const labelHeader = document.createElement('th');
  labelHeader.scope = 'col';
  labelHeader.textContent = 'Course Details';
  headRow.appendChild(labelHeader);
  courses.forEach(course => {
    const columnHeader = document.createElement('th');
    columnHeader.scope = 'col';
    const courseTitle = document.createElement('strong');
    courseTitle.className = 'course-compare-title';
    courseTitle.textContent = course.title;
    const courseCode = document.createElement('span');
    courseCode.className = 'course-compare-code';
    courseCode.textContent = course.code;
    const actions = document.createElement('div');
    actions.className = 'course-compare-column-actions';
    const blueprintButton = document.createElement('button');
    blueprintButton.className = 'table-blueprint-btn';
    blueprintButton.type = 'button';
    blueprintButton.textContent = 'View Blueprint';
    blueprintButton.addEventListener('click', () => openCourseModal(course));
    const removeButton = document.createElement('button');
    removeButton.className = 'course-compare-remove-btn';
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${course.title} from comparison`);
    removeButton.addEventListener('click', () => toggleCourseCompare(course.code));
    actions.append(blueprintButton, removeButton);
    columnHeader.append(courseTitle, courseCode, actions);
    headRow.appendChild(columnHeader);
  });
  head.appendChild(headRow);
  table.appendChild(head);

  const fields = [
    ['Course Code', course => course.code],
    ['Family', course => course.suite],
    ['Duration', course => course.duration],
    ['Hours', course => course.hours],
    ['Software Tools', course => course.tools.join(', ')],
    ['Career Options', course => course.careers.join(', ')],
    ['Industries', course => course.industries]
  ];
  const body = document.createElement('tbody');
  fields.forEach(([label, getValue]) => {
    const row = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = label;
    row.appendChild(rowHeader);
    courses.forEach(course => {
      const cell = document.createElement('td');
      cell.textContent = getValue(course);
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
  table.appendChild(body);
  tableWrap.appendChild(table);
  courseCompareContainer.append(header, tableWrap);
}

function clearCourseCompare() {
  compareCourseCodes.clear();
  try {
    localStorage.removeItem(compareCoursesKey);
  } catch (error) {
    // Keep the cleared selection for this session if storage is unavailable.
  }
  updateSavedCourseUI();
  renderCourseCompareView();
  showToast('Course comparison cleared');
}

function closeSavedCourses() {
  savedCoursesModal?.classList.remove('open');
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === activeViewName);
  });
  if (!courseModal?.classList.contains('open')) document.body.style.overflow = '';
}

document.getElementById('savedCoursesModalClose')?.addEventListener('click', closeSavedCourses);
savedCoursesModal?.addEventListener('click', event => {
  if (event.target === savedCoursesModal) closeSavedCourses();
});

let activeFamily = 'all';
let searchQuery = '';

function applyFilters() {
  // Read the controls directly on every pass so reset, tool shortcuts, and
  // direct dropdown changes always use the current hub selection.
  selectedIndustry = industryFilter?.value || 'all';
  selectedHub = hubFilter?.value || 'all';

  let visible = 0;
  let visibleTable = 0;
  cards.forEach(card => {
    const family = card.dataset.family || '';
    const text = card.textContent.toLowerCase();
    const industries = getCourseIndustries(card);
    const hubs = getCourseHubs(card);

    const matchFamily = activeFamily === 'all' ||
      (activeFamily === 'saved' ? savedCourseCodes.has(getCardCourseCode(card)) : family === activeFamily);
    const matchSearch = !searchQuery || text.includes(searchQuery);
    const matchIndustry = selectedIndustry === 'all' || industries.includes(selectedIndustry);
    const matchHub = selectedHub === 'all' || hubs.some(hub => hub.toLowerCase() === selectedHub.toLowerCase());

    if (matchFamily && matchSearch && matchIndustry && matchHub) {
      card.classList.remove('hidden');
      visible++;
    } else {
      card.classList.add('hidden');
    }
  });

  tableRows.forEach(row => {
    const family = getTableCourseFamily(row);
    const text = row.textContent.toLowerCase();
    const courseCode = getTableCourseCode(row);
    const courseCard = Array.from(cards).find(card => getCardCourseCode(card) === courseCode);
    const industries = courseCard ? getCourseIndustries(courseCard) : [];
    const hubs = courseCard ? getCourseHubs(courseCard) : [];
    const matchFamily = activeFamily === 'all' ||
      (activeFamily === 'saved' ? savedCourseCodes.has(courseCode) : family === activeFamily);
    const matchSearch = !searchQuery || text.includes(searchQuery);
    const matchIndustry = selectedIndustry === 'all' || industries.includes(selectedIndustry);
    const matchHub = selectedHub === 'all' || hubs.some(hub => hub.toLowerCase() === selectedHub.toLowerCase());
    const matches = matchFamily && matchSearch && matchIndustry && matchHub;
    row.classList.toggle('hidden', !matches);
    if (matches) visibleTable++;
  });

  const tableEmptyState = document.getElementById('tableNoResults');
  if (tableEmptyState) {
    const emptySavedTable = activeFamily === 'saved' && savedCourseCodes.size === 0;
    const tableEmptyTitle = document.getElementById('tableEmptyTitle');
    const tableEmptyMessage = document.getElementById('tableEmptyMessage');
    if (tableEmptyTitle) tableEmptyTitle.textContent = emptySavedTable ? 'Your shortlist is empty' : 'No courses match your filters';
    if (tableEmptyMessage) {
      tableEmptyMessage.textContent = emptySavedTable
        ? 'Use a bookmark beside any course to add it to your shortlist.'
        : 'Clear your search or filters to see more courses.';
    }
    tableEmptyState.classList.toggle('hidden', visibleTable > 0);
  }

  if (resultCount) resultCount.textContent = `${visible} course${visible !== 1 ? 's' : ''} found`;
  if (noResults) {
    const noResultsMessage = noResults.querySelector('p');
    const recoveryButton = document.getElementById('clearSearch');
    const emptySavedList = activeFamily === 'saved' && savedCourseCodes.size === 0;
    if (noResultsMessage) {
      noResultsMessage.textContent = emptySavedList
        ? 'No courses saved yet.'
        : searchQuery ? 'No courses match your search.' : 'No courses match your filters.';
    }
    if (recoveryButton) recoveryButton.textContent = emptySavedList ? 'Go to All Courses' : 'Clear filters';
    noResults.classList.toggle('hidden', visible > 0);
  }
  updateCourseTableFilterHighlights();
}

swPills.forEach(pill => {
  pill.setAttribute('aria-pressed', String(pill.classList.contains('active')));
  pill.addEventListener('click', () => {
    swPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    swPills.forEach(p => p.setAttribute('aria-pressed', String(p === pill)));
    activeFamily = pill.dataset.filter;
    applyFilters();
  });
});

// =============================================
// SEARCH
// =============================================
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');

function updateSearchClearButton() {
  if (searchClearBtn) searchClearBtn.style.display = searchInput?.value ? 'flex' : 'none';
}

searchInput?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  updateSearchClearButton();
  applyFilters();
});

searchClearBtn?.addEventListener('click', () => {
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  searchQuery = '';
  updateSearchClearButton();
  applyFilters();
});

function normalizeSoftwareName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\b(adobe|autodesk|foundry)\b/g, '')
    .replace(/\s+\d+(?:\.\d+)*\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const domainDetailModal = document.getElementById('domainDetailModal');
const domainDetailCloseX = document.getElementById('domainDetailCloseX');
const domainDetailCloseFooter = document.getElementById('domainDetailCloseFooter');
let activeDomainTrigger = null;

function normalizeDomainToolName(value) {
  return normalizeSoftwareName(value)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bunreal\s+engine\b/g, 'unreal')
    .replace(/\bsubstance\s+3d\s+painter\b/g, 'substance painter')
    .replace(/\bsubstance\s+3d\b/g, 'substance')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDomainSoftware(domainCard) {
  const softwareText = domainCard.querySelector('p')?.textContent || '';
  const seen = new Set();
  return softwareText
    .split(/[•·–]/)
    .map(tool => tool.trim().replace(/\s+/g, ' '))
    .filter(tool => {
      if (!tool) return false;
      const key = normalizeDomainToolName(tool);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function setDomainPills(container, items, { className, emptyMessage, onSelect }) {
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'domain-related-empty';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `modal-tool-pill ${className}`;
    button.textContent = item.label;
    button.addEventListener('click', event => onSelect(item, event));
    container.appendChild(button);
  });
}

function closeDomainDetailModal({ restoreFocus = true } = {}) {
  if (!domainDetailModal) return;
  domainDetailModal.classList.remove('open');
  domainDetailModal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
  if (restoreFocus && activeDomainTrigger?.isConnected) activeDomainTrigger.focus();
}

function openDomainDetailModal(domainCard, trigger = domainCard) {
  if (!domainDetailModal) return;
  activeDomainTrigger = trigger;

  const title = domainCard.querySelector('h4')?.textContent.trim() || 'Production Domain';
  const software = getDomainSoftware(domainCard);
  const softwareKeys = new Set(software.map(normalizeDomainToolName));
  const relatedCourses = Array.from(cards).map(card => {
    const tools = Array.from(card.querySelectorAll('.tool-chip')).map(chip => chip.textContent.trim());
    const matches = tools.some(tool => softwareKeys.has(normalizeDomainToolName(tool)));
    return matches ? {
      card,
      title: card.querySelector('.role-title')?.textContent.trim() || 'Course Blueprint'
    } : null;
  }).filter(Boolean);
  const relatedJobs = Array.from(new Set(relatedCourses.flatMap(({ card }) =>
    Array.from(card.querySelectorAll('.career-tag')).map(tag => tag.textContent.trim())
  )));

  document.getElementById('domainDetailTitle').textContent = title;
  document.getElementById('domainDetailSummary').textContent =
    `${software.length} software tools · ${relatedCourses.length} related courses · ${relatedJobs.length} job roles`;

  setDomainPills(
    document.getElementById('domainDetailSoftware'),
    software.map(label => ({ label })),
    {
      className: 'modal-software-filter',
      emptyMessage: 'No software tools listed for this domain.',
      onSelect: ({ label }) => {
        closeDomainDetailModal({ restoreFocus: false });
        filterCoursesByTool(label);
      }
    }
  );

  setDomainPills(
    document.getElementById('domainDetailCourses'),
    relatedCourses.map(item => ({ ...item, label: item.title })),
    {
      className: 'domain-course-link',
      emptyMessage: 'No matching courses are listed for these tools yet.',
      onSelect: ({ card }) => {
        closeDomainDetailModal({ restoreFocus: false });
        openCourseModal(extractCardData(card));
      }
    }
  );

  setDomainPills(
    document.getElementById('domainDetailJobs'),
    relatedJobs.map(label => ({ label })),
    {
      className: 'domain-job-link modal-career-link',
      emptyMessage: 'No linked job roles are listed for this domain yet.',
      onSelect: ({ label }, event) => {
        closeDomainDetailModal({ restoreFocus: false });
        openCareerMatrixRole(label, event);
      }
    }
  );

  domainDetailModal.classList.add('open');
  domainDetailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  domainDetailCloseX?.focus();
}

// Production Domain Coverage chips open the same details and related-jobs list
// as the matching domain card, with keyboard support for non-button markup.
document.querySelectorAll('#viewAnalytics .domain-chip').forEach(chip => {
  const title = chip.querySelector('span')?.textContent.trim();
  const matchingDomain = Array.from(document.querySelectorAll('#viewDomains .domain-block'))
    .find(domainCard => domainCard.querySelector('h4')?.textContent.trim() === title);
  if (!matchingDomain) return;

  chip.setAttribute('role', 'button');
  chip.setAttribute('tabindex', '0');
  chip.setAttribute('aria-haspopup', 'dialog');
  chip.setAttribute('aria-label', `Show related software, courses, and jobs for ${title}`);
  chip.addEventListener('click', () => openDomainDetailModal(matchingDomain, chip));
  chip.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openDomainDetailModal(matchingDomain, chip);
  });
});

document.querySelectorAll('#viewDomains .domain-block').forEach(domainCard => {
  domainCard.setAttribute('role', 'button');
  domainCard.setAttribute('tabindex', '0');
  domainCard.setAttribute('aria-haspopup', 'dialog');
  domainCard.setAttribute('aria-label', `Show related software, courses, and jobs for ${domainCard.querySelector('h4')?.textContent.trim() || 'this domain'}`);
  domainCard.addEventListener('click', () => openDomainDetailModal(domainCard));
  domainCard.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openDomainDetailModal(domainCard);
  });
});

domainDetailCloseX?.addEventListener('click', () => closeDomainDetailModal());
domainDetailCloseFooter?.addEventListener('click', () => closeDomainDetailModal());
domainDetailModal?.addEventListener('click', event => {
  if (event.target === domainDetailModal) closeDomainDetailModal();
});

function openCareerMatrixRole(careerName, event) {
  event?.preventDefault();
  event?.stopPropagation();
  window.location.href = `../Maac/index.html?career=${encodeURIComponent(careerName)}`;
}

function openCareerMatrixHub(hubName, event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'siddhan-portal-navigate', view: 'career', hubName }, '*');
    return;
  }
  window.location.href = `../Maac/index.html?hub=${encodeURIComponent(hubName)}`;
}

function openCareerWizard(event) {
  event?.preventDefault();
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'siddhan-portal-navigate',
      view: 'career',
      openWizard: true
    }, '*');
    return;
  }
  window.location.href = '../Maac/index.html?openWizard=1';
}

function filterCoursesByTool(toolName) {
  const query = normalizeSoftwareName(toolName);
  if (!query) return;

  switchView('cards');
  activeFamily = 'all';
  selectedIndustry = 'all';
  selectedHub = 'all';
  if (industryFilter) industryFilter.value = 'all';
  if (hubFilter) hubFilter.value = 'all';
  swPills.forEach(pill => {
    const isAllCourses = pill.dataset.filter === 'all';
    pill.classList.toggle('active', isAllCourses);
    pill.setAttribute('aria-pressed', String(isAllCourses));
  });
  searchQuery = query;
  if (searchInput) searchInput.value = String(toolName).replace(/\b(adobe|autodesk|foundry)\s+/i, '').replace(/\s+\d+(?:\.\d+)*\s*$/i, '').trim();
  updateSearchClearButton();
  applyFilters();

  const hasMatchingCourse = Array.from(cards).some(card =>
    Array.from(card.querySelectorAll('.tool-chip')).some(chip => {
      const chipName = normalizeSoftwareName(chip.textContent);
      return chipName === query || chipName.includes(query) || query.includes(chipName);
    })
  );
  if (hasMatchingCourse) {
    document.getElementById('filterStrip')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Showing courses that use ${toolName}`);
    return;
  }

  const matchingDomain = Array.from(document.querySelectorAll('#viewDomains .domain-block'))
    .find(block => block.textContent.toLowerCase().includes(query));
  if (matchingDomain) {
    switchView('domains');
    requestAnimationFrame(() => matchingDomain.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    showToast(`Showing the production domain for ${toolName}`);
    return;
  }

  document.getElementById('filterStrip')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`No course or domain entry found for ${toolName}`);
}

window.addEventListener('message', event => {
  if (event.source !== window.parent || event.data?.type !== 'siddhan-portal-filter-software') return;
  filterCoursesByTool(event.data.softwareName);
});

function filterCourseTableByTool(toolName) {
  filterCourseTableByValue(toolName, 'software');
}

function filterCourseTableByCareer(careerName) {
  filterCourseTableByValue(careerName, 'career option');
}

function filterCourseTableByValue(value, filterType) {
  const query = normalizeSoftwareName(value);
  if (!query) return;

  activeFamily = 'all';
  selectedIndustry = 'all';
  selectedHub = 'all';
  if (industryFilter) industryFilter.value = 'all';
  if (hubFilter) hubFilter.value = 'all';
  swPills.forEach(pill => {
    const isAllCourses = pill.dataset.filter === 'all';
    pill.classList.toggle('active', isAllCourses);
    pill.setAttribute('aria-pressed', String(isAllCourses));
  });
  searchQuery = query;
  if (searchInput) {
    searchInput.value = String(value)
      .replace(/\b(adobe|autodesk|foundry)\s+/i, '')
      .replace(/\s+\d+(?:\.\d+)*\s*$/i, '')
      .trim();
  }
  updateSearchClearButton();
  applyFilters();
  showToast(`Master Table filtered by ${filterType}: ${value}`);
}

function updateCourseTableFilterHighlights() {
  const query = normalizeSoftwareName(searchQuery);
  document.querySelectorAll('.table-tool-filter, .table-career-filter').forEach(button => {
    const isActive = Boolean(query) && normalizeSoftwareName(button.dataset.filterValue) === query;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function makeCourseTableToolsClickable() {
  tableRows.forEach(row => {
    const toolsCell = row.cells[5];
    if (toolsCell && !toolsCell.querySelector('.table-tool-filter')) {
      const tools = toolsCell.textContent.split(',').map(tool => tool.trim()).filter(Boolean);
      toolsCell.replaceChildren();
      tools.forEach(tool => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'table-tool-filter';
        button.dataset.filterValue = tool;
        button.textContent = tool;
        button.setAttribute('aria-label', `Filter the Master Table by software: ${tool}`);
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          filterCourseTableByTool(tool);
        });
        toolsCell.appendChild(button);
      });
    }

    const careersCell = row.cells[6];
    if (careersCell && !careersCell.querySelector('.table-career-filter')) {
      const careers = careersCell.textContent.split(',').map(career => career.trim()).filter(Boolean);
      careersCell.replaceChildren();
      careers.forEach(career => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'table-career-filter';
        button.dataset.filterValue = career;
        button.textContent = career;
        button.setAttribute('aria-label', `Filter the Master Table by career option: ${career}`);
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          filterCourseTableByCareer(career);
        });
        careersCell.appendChild(button);
      });
    }
  });
}

document.querySelectorAll('[data-course-tool]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    filterCoursesByTool(link.dataset.courseTool);
  });
});

function makeSoftwareTargetClickable(element, getLabel, stopCardClick = false) {
  const label = getLabel()?.trim();
  if (!label) return;
  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');
  element.setAttribute('aria-label', `Show courses that cover ${label}`);

  const activate = event => {
    event.preventDefault();
    if (stopCardClick) event.stopPropagation();
    filterCoursesByTool(label);
  };
  element.addEventListener('click', activate);
  element.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.stopPropagation();
    activate(event);
  });
}

document.querySelectorAll('.role-card .tool-chip').forEach(chip => {
  makeSoftwareTargetClickable(chip, () => chip.textContent, true);
});

document.querySelectorAll('.role-card .career-tag').forEach(tag => {
  const careerName = tag.textContent.trim();
  tag.setAttribute('role', 'link');
  tag.setAttribute('tabindex', '0');
  tag.setAttribute('aria-label', `Open Career Matrix details for ${careerName}`);

  const openCareerDetail = event => {
    openCareerMatrixRole(careerName, event);
  };
  tag.addEventListener('click', openCareerDetail);
  tag.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    openCareerDetail(event);
  });
});

document.querySelectorAll('#viewAnalytics .bar-item').forEach(item => {
  makeSoftwareTargetClickable(item, () => item.querySelector('.bar-label')?.textContent);
});

document.querySelectorAll('[data-course-view][data-course-target]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (link.dataset.resetCourseFilters === 'true') {
      document.getElementById('resetBtn')?.click();
    }
    const viewName = link.dataset.courseView;
    const target = document.getElementById(link.dataset.courseTarget);
    switchView(viewName);
    requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });
});

// Clear search
document.getElementById('clearSearch')?.addEventListener('click', () => {
  if (searchInput) searchInput.value = '';
  searchQuery = '';
  selectedIndustry = 'all';
  selectedHub = 'all';
  if (industryFilter) industryFilter.value = 'all';
  if (hubFilter) hubFilter.value = 'all';
  updateSearchClearButton();
  activeFamily = 'all';
  swPills.forEach(pill => {
    const isAllCourses = pill.dataset.filter === 'all';
    pill.classList.toggle('active', isAllCourses);
    pill.setAttribute('aria-pressed', String(isAllCourses));
  });
  applyFilters();
});

document.getElementById('clearTableFilters')?.addEventListener('click', () => {
  document.getElementById('clearSearch')?.click();
});

// =============================================
// SORT
// =============================================
const sortSelect = document.getElementById('sortSelect');
const originalCardOrder = Array.from(cards);
const originalTableOrder = Array.from(tableRows);

function getDurationSortValue(text) {
  return parseFloat(String(text || '').match(/[\d.]+/)?.[0] || 0);
}

function sortCourseViews(value) {
  const grid = document.getElementById('rolesGrid');
  const tableBody = document.querySelector('.master-table tbody');

  const compare = (a, b, getName, getDuration, getCode) => {
    if (value === 'name-az') return getName(a).localeCompare(getName(b));
    if (value === 'name-za') return getName(b).localeCompare(getName(a));
    if (value === 'code-az') return getCode(a).localeCompare(getCode(b), undefined, { numeric: true });
    if (value === 'code-za') return getCode(b).localeCompare(getCode(a), undefined, { numeric: true });
    if (value === 'duration-high') return getDuration(b) - getDuration(a);
    if (value === 'duration-low') return getDuration(a) - getDuration(b);
    return 0;
  };

  const cardArray = value === 'default'
    ? [...originalCardOrder]
    : [...(grid?.querySelectorAll('.role-card') || [])].sort((a, b) =>
        compare(
          a,
          b,
          card => card.dataset.name || '',
          card => getDurationSortValue(card.dataset.duration),
          card => getCardCourseCode(card)
        )
      );
  cardArray.forEach(card => grid?.appendChild(card));

  const tableRowsInOrder = value === 'default'
    ? [...originalTableOrder]
    : [...tableRows].sort((a, b) => {
        return compare(
          a,
          b,
          row => row.querySelectorAll('td')[2]?.textContent.trim() || '',
          row => getDurationSortValue(row.querySelectorAll('td')[3]?.textContent),
          row => getTableCourseCode(row)
        );
      });
  tableRowsInOrder.forEach(row => tableBody?.appendChild(row));
}

sortSelect?.addEventListener('change', () => {
  sortCourseViews(sortSelect.value);
  showToast(`Sorted by ${sortSelect.options[sortSelect.selectedIndex].text}`);
});

// =============================================
// GRID / LIST TOGGLE
// =============================================
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const rolesGrid = document.getElementById('rolesGrid');

gridViewBtn?.addEventListener('click', () => {
  gridViewBtn.classList.add('active');
  listViewBtn.classList.remove('active');
  rolesGrid?.classList.remove('list-view');
});
listViewBtn?.addEventListener('click', () => {
  listViewBtn.classList.add('active');
  gridViewBtn.classList.remove('active');
  rolesGrid?.classList.add('list-view');
});

// =============================================
// RESET FILTERS
// =============================================
document.getElementById('resetBtn')?.addEventListener('click', () => {
  swPills.forEach(p => {
    const isAllCourses = p.dataset.filter === 'all';
    p.classList.toggle('active', isAllCourses);
    p.setAttribute('aria-pressed', String(isAllCourses));
  });
  activeFamily = 'all';
  searchQuery = '';
  selectedIndustry = 'all';
  selectedHub = 'all';
  if (searchInput) searchInput.value = '';
  updateSearchClearButton();
  if (industryFilter) industryFilter.value = 'all';
  if (hubFilter) hubFilter.value = 'all';
  if (sortSelect) sortSelect.value = 'code-az';
  sortCourseViews('code-az');
  rolesGrid?.classList.remove('list-view');
  gridViewBtn?.classList.add('active');
  listViewBtn?.classList.remove('active');
  applyFilters();
  showToast('Filters reset');
});

// =============================================
// ANALYTICS BAR ANIMATION
// =============================================
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const w = bar.style.width || bar.style.getPropertyValue('--w');
    if (!w) return;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = w;
      });
    });
  });
}

// =============================================
// CONTACT FORM
// =============================================
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  const values = new FormData(form);
  const body = [
    `Name: ${values.get('name') || ''}`,
    `Phone: ${values.get('phone') || 'Not provided'}`,
    `Email: ${values.get('email') || ''}`,
    `Course of Interest: ${values.get('course') || 'Not selected'}`,
    '',
    'Message:',
    values.get('message') || ''
  ].join('\n');
  const subject = `Course enquiry from ${values.get('name') || 'website visitor'}`;
  window.location.href = `mailto:siddhantechnologies@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('Your email app will open with the enquiry. Send the email to complete it.');
});

// =============================================
// TOAST NOTIFICATION
// =============================================
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// =============================================
// BACK TO TOP
// =============================================
const bttBtn = document.getElementById('bttBtn');
window.addEventListener('scroll', () => {
  bttBtn?.classList.toggle('visible', window.scrollY > 300);
});
bttBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =============================================
// SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// =============================================
// HEADER SCROLL EFFECT
// =============================================
const siteHeader = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 10);
});

// =============================================
// COURSE DETAIL MODAL & PDF BLUEPRINT GENERATOR
// =============================================
const courseModal = document.getElementById('courseModal');
const modalBox = document.getElementById('modalBox');
const modalCloseX = document.getElementById('modalCloseX');
const modalClosBtn = document.getElementById('modalClosBtn');
const modalPdfBtn = document.getElementById('modalPdfBtn');
const modalCopyBtn = document.getElementById('modalCopyBtn');
const modalBookmarkBtn = document.getElementById('modalBookmarkBtn');

let currentCourse = null;

// Generate rich workflows & portfolio recommendations
function getCurriculumDetails(code, family, tools, title) {
  const fam = (family || '').toLowerCase();
  const t = tools.join(' ').toLowerCase();
  const tit = (title || '').toLowerCase();
  const c = (code || '').toLowerCase();

  let workflow = '';
  let portfolio = '';

  if (tit.includes('blender') || c.includes('blender')) {
    workflow = 'Hard-surface asset modeling in Blender 4.x, sculpting dynamic characters, procedural geometry modeling with Geometry Nodes, node-based procedural shaders, and multi-light rendering in Cycles and Eevee Next.';
    portfolio = 'A comprehensive Blender production showreel featuring procedural asset generators, textured character turntables, lighting lookdev, and Cycles photorealistic render passes.';
  } else if (tit.includes('ui/ux') || c.includes('uiux')) {
    workflow = 'Conducting user research & persona mapping, creating low-fidelity wireframes in Miro/Balsamiq, authoring scalable component design systems in Figma, and building clickable high-fidelity interactive prototypes.';
    portfolio = 'End-to-end UI/UX product design case studies with problem framing, user journey maps, wireframes, design systems, and responsive Figma prototypes for mobile and web apps.';
  } else if (tit.includes('premiere') && tit.includes('audition')) {
    workflow = 'Multi-camera timeline cutting and J/L-cut transitions in Premiere Pro, Lumetri color grading curves, dialogue denoise and audio restoration in Audition, Foley sound design and 5.1 broadcast mixing.';
    portfolio = 'A narrative video editing and sound design portfolio showcasing dramatic cut pacing, multi-track audio cleanup, Foley ambiance, and broadcast-compliant loudness mixes.';
  } else if (tit.includes('motion graphics') || c.includes('mg-pro')) {
    workflow = 'Kinetic typography design, 2.5D character motion in After Effects, 3D particle and simulation FX with Trapcode and Cinema 4D, commercial title stings, and social media brand motion graphics.';
    portfolio = 'A high-energy motion graphics showreel featuring broadcast channel packages, kinetic title sequences, animated brand logos, and 3D motion design case studies.';
  } else if (tit.includes('advanced compositing') || c.includes('adv-comp')) {
    workflow = 'Multi-channel EXR CG pass integration in Foundry Nuke, planar tracking and roto replacement with Mocha Pro, clean plate reconstruction, 3D camera tracking, grain matching and deep compositing.';
    portfolio = 'A professional feature-film VFX compositing reel showing before-and-after breakdowns, green-screen extraction, planar screen replacement, and photorealistic CG integration.';
  } else if (tit.includes('compositing and editing') || c.includes('cep')) {
    workflow = 'Multi-track narrative video editing in Premiere, node-based compositing in Nuke, motion graphics in After Effects, DI color grading in DaVinci Resolve, and synchronized stereo sound design in Audition.';
    portfolio = 'A dual post-production reel featuring commercial film edits, VFX composite shots, DaVinci Resolve color grading passes, and clean audio mixes.';
  } else if (tit.includes('dgwa') || tit.includes('digital media') || tit.includes('apdmd') || tit.includes('cgpd')) {
    workflow = 'Synthesizing brand visual moodboards, designing vector logos in Illustrator, authoring print layouts in InDesign, building responsive web interfaces in Figma & HTML5, and animating 2D character vignettes in Animate CC.';
    portfolio = 'A complete corporate design & digital media portfolio featuring full brand guidelines, packaging mockups, interactive web layouts, and 2D animated promotional assets.';
  } else if (fam.includes('vfx') || t.includes('nuke') || t.includes('after effects')) {
    workflow = 'Pulling clean keys with Keylight, tracking screen graphics via Mocha Pro, matching black levels, grain matching on CG elements, and compositing multi-pass EXR layers in Foundry Nuke.';
    portfolio = 'A visual effects breakdown reel with green screen chroma extraction, Mocha planar tracking replacement, CG asset integration, and multipass light wrap composites.';
  } else if (tit.includes('realtime') || t.includes('unreal')) {
    workflow = 'Importing Nanite meshes into Unreal Engine 5, configuring Lumen global illumination, setting up real-time materials, building virtual environments, and rendering cinematics in Sequencer.';
    portfolio = 'An Unreal Engine 5 virtual environment / ArchViz portfolio showcasing photorealistic real-time lighting, interactive asset walk-throughs, and Sequencer cinematic renders.';
  } else {
    // 3D Animation & Modeling
    workflow = 'High-poly character sculpting in ZBrush, retopologizing clean quad geometry in Maya, baking multi-channel 4K PBR textures in Substance Painter, body mechanics animation, and rendering beauty passes in Arnold.';
    portfolio = 'A 3D character/prop showreel with turntable wireframe views, UV tile unwrapping, texture channel maps (Base, Roughness, Normal), and Arnold cinematic beauty lighting.';
  }

  return { workflow, portfolio };
}

// Extract course data from a role-card element
function extractCardData(card) {
  const code = card.querySelector('.role-id-badge')?.textContent.trim() || 'SID-101';
  const suite = card.querySelector('.suite-pill')?.textContent.trim() || '3D & MEDIA';
  const title = card.querySelector('.role-title')?.textContent.trim() || 'Course Specialization';
  const industries = card.querySelector('.role-industries')?.textContent.trim() || 'Media & Entertainment Production';
  const responsibilities = card.querySelector('.role-desc')?.textContent.trim() || 'Comprehensive industry curriculum covering professional production pipelines and studio tools.';
  
  const toolChips = card.querySelectorAll('.tool-chip');
  const tools = Array.from(toolChips).map(c => c.textContent.trim());

  const metaText = card.querySelector('.meta-item')?.textContent.trim() || '12 Months · 576 Hrs';
  const durationMatch = metaText.match(/([\d.]+\s*Months?)/i);
  const hoursMatch = metaText.match(/(\d+\s*Hrs)/i);
  const duration = durationMatch ? durationMatch[1] : '12 Months';
  const hours = hoursMatch ? hoursMatch[1] : '576 Hrs';

  const careerTags = card.querySelectorAll('.career-tag');
  const careers = Array.from(careerTags).map(t => t.textContent.trim());

  const { workflow, portfolio } = getCurriculumDetails(code, suite, tools, title);
  const hubs = getCourseHubs(card);

  return {
    code,
    suite,
    demand: 'Very High Demand',
    title,
    industries,
    responsibilities,
    workflow,
    tools: tools.length ? tools : ['Autodesk Maya', '3ds Max', 'Substance 3D', 'Arnold', 'Unreal Engine'],
    portfolio,
    careers: careers.length ? careers : ['3D Artist', 'Production Specialist', 'Technical Director'],
    duration,
    hours,
    durationMeta: metaText,
    hubs: hubs.length ? hubs.join(' · ') : 'Mumbai · Chennai · Hyderabad · Bengaluru · Pune · Delhi NCR · Remote'
  };
}

// Open modal with course data
function openCourseModal(course) {
  currentCourse = course;
  updateSavedCourseUI();

  document.getElementById('mCode').textContent = course.code;
  document.getElementById('mSuite').textContent = course.suite.toUpperCase();
  document.getElementById('mDemandText').textContent = course.demand;
  document.getElementById('mTitle').textContent = course.title;
  document.getElementById('mIndustries').textContent = course.industries;
  document.getElementById('mResponsibilities').textContent = course.responsibilities;
  document.getElementById('mWorkflow').textContent = course.workflow;
  document.getElementById('mPortfolio').textContent = course.portfolio;
  document.getElementById('mDuration').textContent = course.duration;
  document.getElementById('mHours').textContent = course.hours;
  const hubsContainer = document.getElementById('mHubs');
  hubsContainer.replaceChildren();
  hubsContainer.classList.add('modal-hubs-list');
  String(course.hubs || '').split(/[·,]/).map(hub => hub.trim()).filter(Boolean).forEach(hub => {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'modal-hub-link';
    link.setAttribute('aria-label', `Show Career job demand in ${hub}`);
    link.textContent = hub;
    link.addEventListener('click', event => openCareerMatrixHub(hub, event));
    hubsContainer.appendChild(link);
  });

  // Software Tools pills
  const toolsContainer = document.getElementById('mTools');
  toolsContainer.innerHTML = '';
  course.tools.forEach(tool => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'modal-tool-pill modal-software-filter';
    pill.setAttribute('aria-label', `Show courses that use ${tool}`);
    pill.textContent = tool;
    pill.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      closeCourseModal();
      filterCoursesByTool(tool);
    });
    toolsContainer.appendChild(pill);
  });

  // Career Opportunities tags
  const careersContainer = document.getElementById('mCareers');
  careersContainer.innerHTML = '';
  course.careers.forEach(career => {
    const tag = document.createElement('span');
    tag.className = 'modal-tool-pill modal-career-link';
    tag.setAttribute('role', 'link');
    tag.setAttribute('tabindex', '0');
    tag.setAttribute('aria-label', `Open Career Matrix details for ${career}`);
    tag.style.background = 'rgba(99, 102, 241, 0.12)';
    tag.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    tag.style.color = '#a5b4fc';
    tag.textContent = career;
    tag.addEventListener('click', event => openCareerMatrixRole(career, event));
    tag.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      openCareerMatrixRole(career, event);
    });
    careersContainer.appendChild(tag);
  });

  // Open modal
  courseModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  courseModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Extract course data from a table row element
function extractTableRowData(row) {
  const code = getTableCourseCode(row) || row.querySelector('.mono')?.textContent.trim() || 'SID-101';
  const suite = row.querySelector('.suite-chip')?.textContent.trim() || '3D Animation';
  const cells = row.querySelectorAll('td');
  const title = cells[2]?.textContent.trim() || 'Course';
  const rawDuration = cells[3]?.textContent.trim() || '12 mo';
  const hours = (cells[4]?.textContent.trim() || '576') + ' Hrs';
  const toolsStr = cells[5]?.textContent.trim() || '';
  const tools = toolsStr.split(',').map(s => s.trim()).filter(Boolean);
  const careersStr = cells[6]?.textContent.trim() || '';
  const careers = careersStr.split(',').map(s => s.trim()).filter(Boolean);

  const durClean = rawDuration.toLowerCase().replace(/months?|mo|\./g, '').trim();
  const duration = durClean ? `${durClean} Months` : '12 Months';

  const { workflow, portfolio } = getCurriculumDetails(code, suite, tools, title);
  const matchingCard = Array.from(cards).find(card =>
    card.querySelector('.role-id-badge')?.textContent.trim() === code
  );
  const hubs = matchingCard ? getCourseHubs(matchingCard) : [];

  return {
    code,
    suite,
    demand: 'Very High Demand',
    title,
    industries: 'Professional Media & Entertainment Production',
    responsibilities: `Advanced curriculum covering ${tools.join(', ')} for production studio environments.`,
    workflow,
    tools: tools.length ? tools : ['Autodesk Maya', 'Photoshop'],
    portfolio,
    careers: careers.length ? careers : ['Studio Artist'],
    duration,
    hours,
    durationMeta: `${duration} · ${hours}`,
    hubs: hubs.length ? hubs.join(' · ') : 'Mumbai · Chennai · Hyderabad · Bengaluru · Pune · Delhi NCR · Remote'
  };
}

function createSaveButton(code, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['save-course-btn', className].filter(Boolean).join(' ');
  button.dataset.courseCode = code;
  button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
  if (!className.split(/\s+/).includes('table-save-btn')) {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggleSavedCourse(code);
    });
  }
  return button;
}

function createCompareButton(code, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['compare-course-btn', className].filter(Boolean).join(' ');
  button.dataset.courseCode = code;
  button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggleCourseCompare(code);
  });
  return button;
}

function initializeSaveButtons() {
  cards.forEach(card => {
    const code = getCardCourseCode(card);
    const footer = card.querySelector('.role-footer');
    if (!code || !footer || footer.querySelector('.save-course-btn')) return;
    const detailsButton = footer.querySelector('.btn-card-details');
    const actions = document.createElement('div');
    actions.className = 'course-card-actions';
    if (detailsButton) actions.appendChild(detailsButton);
    actions.appendChild(createSaveButton(code, ''));
    actions.appendChild(createCompareButton(code, ''));
    footer.appendChild(actions);
  });

  tableRows.forEach(row => {
    const code = getTableCourseCode(row);
    const cell = row.querySelector('td:last-child');
    if (!code || !cell || cell.querySelector('.table-save-btn')) return;

    const actions = document.createElement('div');
    actions.className = 'table-action-group';
    const blueprintButton = cell.querySelector('.table-blueprint-btn');
    if (blueprintButton) actions.appendChild(blueprintButton);
    actions.appendChild(createSaveButton(code, 'table-save-btn'));
    actions.appendChild(createCompareButton(code, 'table-compare-btn'));
    cell.appendChild(actions);
  });

  updateSavedCourseUI();
}

initializeSaveButtons();

// Handle table bookmarks during capture so the row's blueprint click cannot intercept them.
document.querySelector('.master-table')?.addEventListener('click', event => {
  const button = event.target.closest('.table-save-btn');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  toggleSavedCourse(button.dataset.courseCode || '');
}, true);

// Attach click listeners to all role cards & View Blueprint buttons
document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', (e) => {
    // Don't trigger if user clicked an anchor inside
    if (e.target.closest('a')) return;
    const course = extractCardData(card);
    openCourseModal(course);
  });

  const btn = card.querySelector('.btn-card-details');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const course = extractCardData(card);
      openCourseModal(course);
    });
  }
});

// Attach click listeners to master table rows & table blueprint buttons
document.querySelectorAll('.master-table tbody tr').forEach(row => {
  row.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    const course = extractTableRowData(row);
    openCourseModal(course);
  });

  const btn = row.querySelector('.table-blueprint-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const course = extractTableRowData(row);
      openCourseModal(course);
    });
  }
});

// Modal close button handlers
modalCloseX?.addEventListener('click', closeCourseModal);
modalClosBtn?.addEventListener('click', closeCourseModal);

// Close on backdrop click
courseModal?.addEventListener('click', (e) => {
  if (e.target === courseModal) closeCourseModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (domainDetailModal?.classList.contains('open')) closeDomainDetailModal();
  else if (savedCoursesModal?.classList.contains('open')) closeSavedCourses();
  else if (courseModal.classList.contains('open')) closeCourseModal();
});

// Persistent course save toggle
modalBookmarkBtn?.addEventListener('click', () => {
  if (currentCourse) toggleSavedCourse(currentCourse.code);
});

// Copy details
modalCopyBtn?.addEventListener('click', () => {
  if (!currentCourse) return;
  const copyText = `SIDDHAN TECHNOLOGIES | COURSE BLUEPRINT
--------------------------------------------------
Course Code: ${currentCourse.code}
Title: ${currentCourse.title}
Domain: ${currentCourse.suite}
Duration: ${currentCourse.duration} (${currentCourse.hours})
Tools: ${currentCourse.tools.join(', ')}
Careers: ${currentCourse.careers.join(', ')}

SIDDHAN TECHNOLOGIES
Phone: +91 96007 47753
Email: siddhantechnologies@gmail.com
--------------------------------------------------`;

  navigator.clipboard.writeText(copyText).then(() => {
    showToast('✓ Course blueprint copied to clipboard!');
  }).catch(() => {
    showToast('✓ Blueprint details copied!');
  });
});

// =============================================
// PDF BLUEPRINT DOWNLOAD (Using jsPDF)
// =============================================
function downloadCoursePDF(course) {
  // If no course passed, fall back to currentCourse or the first card
  if (!course) {
    if (currentCourse) {
      course = currentCourse;
    } else {
      const activeCard = document.querySelector('.role-card');
      course = activeCard ? extractCardData(activeCard) : null;
    }
  }

  if (!course) {
    showToast('⚠️ Please select a course blueprint first');
    return;
  }

  const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);

  if (!jsPDFConstructor) {
    showToast('Preparing course blueprint print view...');
    window.print();
    return;
  }

  try {
    showToast(`Generating ${course.code || 'Course'} vector PDF blueprint...`);

    const doc = new jsPDFConstructor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Helper to sanitize Unicode symbols for standard Helvetica PDF font
    const clean = (s) => (s || '')
      .replace(/•/g, '-')
      .replace(/©/g, '(c)')
      .replace(/—/g, '-')
      .replace(/–/g, '-')
      .replace(/·/g, '-');

    const courseCode = course.code || 'SID-COURSE';
    const courseSuite = clean(course.suite || '3D Animation').toUpperCase();
    const courseTitle = clean(course.title || 'Course Specialization');
    const courseIndustries = clean(course.industries || 'Media & Entertainment Production');
    const courseDuration = clean(course.duration || '12 Months');
    const courseHours = clean(course.hours || '576 Hrs');
    const courseResp = clean(course.responsibilities || 'Comprehensive industry curriculum covering professional production pipelines.');
    const courseWorkflow = clean(course.workflow || 'Studio-standard production workflows and pipeline integration.');
    const coursePortfolio = clean(course.portfolio || 'Industry-standard showcase showreel and portfolio.');
    const toolsArr = Array.isArray(course.tools) && course.tools.length ? course.tools : ['Autodesk Maya', '3ds Max', 'Substance 3D', 'Unreal Engine'];
    const careersArr = Array.isArray(course.careers) && course.careers.length ? course.careers : ['Production Artist', 'Studio Specialist'];

    // Background
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, 210, 297, 'F');

    // Header Banner Box
    doc.setFillColor(19, 29, 52);
    doc.roundedRect(14, 14, 182, 38, 4, 4, 'F');
    
    // Organization Logo / Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(56, 189, 248); // Cyan
    doc.text('SIDDHAN TECHNOLOGIES', 20, 26);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('CAREER INTELLIGENCE MATRIX | OFFICIAL COURSE BLUEPRINT', 20, 32);
    doc.text('Phone: +91 96007 47753  |  Email: siddhantechnologies@gmail.com', 20, 38);

    // Badge Line
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(165, 180, 252);
    doc.text(`[ CODE: ${courseCode} ]   |   FAMILY: ${courseSuite}   |   STATUS: VERIFIED`, 20, 46);

    // Course Title & Subtitle
    let y = 62;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(courseTitle, 175);
    doc.text(titleLines, 16, y);
    y += titleLines.length * 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(56, 189, 248);
    doc.text(courseIndustries, 16, y);
    y += 7;

    // Thin separator
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.line(16, y, 194, y);
    y += 7;

    // Duration & Hours
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('DURATION & TRAINING HOURS', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(241, 245, 249);
    doc.text(`${courseDuration}  (${courseHours} Practical Hands-on Training)`, 16, y);
    y += 9;

    // Core Responsibilities
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('CORE INDUSTRY RESPONSIBILITIES', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    const respLines = doc.splitTextToSize(courseResp, 175);
    doc.text(respLines, 16, y);
    y += respLines.length * 4.5 + 4;

    // Workflow
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('DAY-IN-THE-LIFE & PRODUCTION WORKFLOW', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    const workLines = doc.splitTextToSize(courseWorkflow, 175);
    doc.text(workLines, 16, y);
    y += workLines.length * 4.5 + 4;

    // Software Ecosystem
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('FULL COMPANION SOFTWARE ECOSYSTEM', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    const toolStr = toolsArr.map(clean).join('   |   ');
    const toolLines = doc.splitTextToSize(toolStr, 175);
    doc.text(toolLines, 16, y);
    y += toolLines.length * 4.5 + 4;

    // Portfolio Box
    doc.setFillColor(25, 33, 60);
    doc.roundedRect(14, y, 182, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(165, 180, 252);
    doc.text('HIRING PORTFOLIO RECOMMENDATION', 18, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(241, 245, 249);
    const portLines = doc.splitTextToSize(coursePortfolio, 174);
    doc.text(portLines, 18, y + 11.5);
    y += 28;

    // Career Roles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('CAREER OPPORTUNITIES & JOB PROFILES', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(241, 245, 249);
    const careerStr = careersArr.map(clean).join('   |   ');
    const careerLines = doc.splitTextToSize(careerStr, 175);
    doc.text(careerLines, 16, y);
    y += careerLines.length * 4.5 + 4;

    // Key Production Hubs
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(129, 140, 248);
    doc.text('KEY PRODUCTION HUBS & MARKETS', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Mumbai   |   Chennai   |   Hyderabad   |   Bengaluru   |   Pune   |   Delhi NCR   |   Global Remote', 16, y);

    // Footer Verification
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.line(16, 276, 194, 276);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('(c) 2026 SIDDHAN TECHNOLOGIES. All rights reserved. | Official Syllabus Blueprint', 16, 282);
    doc.text('Phone: +91 96007 47753 | Email: siddhantechnologies@gmail.com', 16, 287);

    // Save File
    const safeFilename = `SIDDHAN_TECHNOLOGIES_${courseCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_Blueprint.pdf`;
    doc.save(safeFilename);
    showToast(`✓ Downloaded ${safeFilename}`);
  } catch (err) {
    console.error('PDF blueprint generation error:', err);
    showToast('⚠️ PDF engine error, opening print blueprint view...');
    window.print();
  }
}

function downloadSavedCoursesPDF() {
  const savedCards = Array.from(cards).filter(card => savedCourseCodes.has(getCardCourseCode(card)));
  if (!savedCards.length) {
    showToast('Save at least one course before downloading the shortlist.');
    return;
  }

  const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);
  if (!jsPDFConstructor) {
    showToast('The PDF tool is unavailable. Refresh the page and try again.');
    return;
  }

  try {
    const courses = savedCards.map(extractCardData);
    const doc = new jsPDFConstructor({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const textWidth = pageWidth - margin * 2;
    let y = 43;

    const clean = value => String(value || '')
      .replace(/[•·]/g, ' | ')
      .replace(/[–—]/g, '-')
      .replace(/[’]/g, "'")
      .replace(/[“”]/g, '"');

    const drawPageHeader = () => {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(12, 12, pageWidth - 24, 23, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('SIDDHAN TECHNOLOGIES', 18, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(125, 211, 252);
      doc.text(`SAVED COURSE SHORTLIST  |  ${courses.length} COURSE${courses.length === 1 ? '' : 'S'}`, 18, 29);
      y = 44;
    };

    const nextPage = () => {
      doc.addPage();
      drawPageHeader();
    };

    const writeWrappedLines = (value, { font = 'normal', size = 9, color = [51, 65, 85], lineHeight = 4.5 } = {}) => {
      const lines = doc.splitTextToSize(clean(value), textWidth);
      doc.setFont('helvetica', font);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      lines.forEach(line => {
        if (y > pageHeight - 20) nextPage();
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    const writeDetail = (label, value) => {
      if (!value) return;
      if (y > pageHeight - 34) nextPage();
      writeWrappedLines(label.toUpperCase(), { font: 'bold', size: 7.5, color: [79, 70, 229], lineHeight: 4 });
      writeWrappedLines(value, { size: 9, color: [51, 65, 85], lineHeight: 4.5 });
      y += 2;
    };

    drawPageHeader();
    courses.forEach((course, index) => {
      if (y > pageHeight - 38) nextPage();
      doc.setFillColor(224, 231, 255);
      doc.roundedRect(margin, y - 4, textWidth, 9, 1.5, 1.5, 'F');
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202);
      doc.text(`${clean(course.code)}  |  ${clean(course.suite).toUpperCase()}`, margin + 3, y + 1.5);
      y += 11;

      writeWrappedLines(`${index + 1}. ${course.title}`, { font: 'bold', size: 12, color: [15, 23, 42], lineHeight: 5.5 });
      writeDetail('Duration & training hours', `${course.duration}  |  ${course.hours}`);
      writeDetail('Course focus', course.industries);
      writeDetail('Software tools', (course.tools || []).join(', '));
      writeDetail('Career options', (course.careers || []).join(', '));
      writeDetail('Overview', course.responsibilities);

      if (index < courses.length - 1) {
        if (y > pageHeight - 22) nextPage();
        else {
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.25);
          doc.line(margin, y, pageWidth - margin, y);
          y += 7;
        }
      }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('SIDDHAN TECHNOLOGIES  |  Course Matrix', margin, pageHeight - 8);
      doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    const filename = 'SIDDHAN_TECHNOLOGIES_Saved_Courses_Shortlist.pdf';
    doc.save(filename);
    showToast(`Downloaded saved courses PDF (${courses.length} course${courses.length === 1 ? '' : 's'}).`);
  } catch (error) {
    console.error('Saved courses PDF generation error:', error);
    showToast('Could not create the saved courses PDF. Please try again.');
  }
}

function getSavedCourseExportData() {
  return Array.from(cards)
    .filter(card => savedCourseCodes.has(getCardCourseCode(card)))
    .map(extractCardData);
}

function downloadSavedCoursesData(format) {
  const courses = getSavedCourseExportData();
  if (!courses.length) return showToast('Save at least one course before exporting.');

  let content;
  let mimeType;
  let extension;
  if (format === 'csv') {
    const columns = ['Course Code', 'Course Family', 'Course Name', 'Course Focus', 'Duration', 'Hours', 'Software Tools', 'Career Options', 'Overview'];
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = courses.map(course => [
      course.code, course.suite, course.title, course.industries, course.duration, course.hours,
      (course.tools || []).join(' | '), (course.careers || []).join(' | '), course.responsibilities
    ]);
    content = `\uFEFF${[columns, ...rows].map(row => row.map(quote).join(',')).join('\r\n')}`;
    mimeType = 'text/csv;charset=utf-8';
    extension = 'csv';
  } else {
    content = JSON.stringify(courses, null, 2);
    mimeType = 'application/json;charset=utf-8';
    extension = 'json';
  }

  const blobUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `SIDDHAN_TECHNOLOGIES_Saved_Courses.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  showToast(`Downloaded saved courses ${extension.toUpperCase()} file.`);
}

function printSavedCourses() {
  const courses = getSavedCourseExportData();
  if (!courses.length) return showToast('Save at least one course before printing.');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return showToast('Allow the print window to open, then try again.');

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const courseRows = courses.map(course => `
    <article class="course">
      <div class="badges"><span>${escapeHtml(course.code)}</span><strong>${escapeHtml(course.suite)}</strong></div>
      <h2>${escapeHtml(course.title)}</h2>
      <p class="focus">${escapeHtml(course.industries)}</p>
      <p><b>Duration:</b> ${escapeHtml(course.duration)} · <b>Hours:</b> ${escapeHtml(course.hours)}</p>
      <p><b>Software:</b> ${escapeHtml((course.tools || []).join(', '))}</p>
      <p><b>Career options:</b> ${escapeHtml((course.careers || []).join(', '))}</p>
      <p><b>Overview:</b> ${escapeHtml(course.responsibilities)}</p>
    </article>
  `).join('');

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Saved Courses Shortlist</title>
    <style>
      *{box-sizing:border-box}body{margin:0;padding:32px;font:14px/1.5 Arial,sans-serif;color:#172033}
      header{padding:18px 20px;margin-bottom:22px;background:#0f172a;color:#fff;border-radius:10px}
      header p{margin:4px 0 0;color:#bae6fd;font-size:12px;letter-spacing:.08em}
      .course{padding:16px 18px;margin:0 0 14px;border:1px solid #d7dce5;border-radius:10px;break-inside:avoid}
      .badges{display:flex;gap:8px;align-items:center;color:#64748b;font-size:11px;font-weight:bold}
      .badges strong{padding:3px 8px;border:1px solid #f0abfc;border-radius:20px;color:#a21caf;background:#fdf4ff}
      h2{margin:8px 0 4px;font-size:17px}.course p{margin:5px 0}.focus{color:#0284c7;font-weight:600}
      @media print{body{padding:0}header,.course{break-inside:avoid}}
    </style></head><body><header><strong>SIDDHAN TECHNOLOGIES</strong><p>COURSE MATRIX · SAVED SHORTLIST (${courses.length})</p></header>${courseRows}</body></html>`);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
}

function clearSavedCourses() {
  if (!savedCourseCodes.size) return;
  savedCourseCodes.clear();
  try {
    localStorage.setItem(savedCoursesKey, '[]');
  } catch (error) {
    // Keep the cleared list for this session if browser storage is unavailable.
  }
  updateSavedCourseUI();
  applyFilters();
  renderSavedCoursesModal();
  showToast('Saved courses cleared.');
}

// Bind PDF download buttons
modalPdfBtn?.addEventListener('click', () => downloadCoursePDF(currentCourse));
savedCoursesPdfBtn?.addEventListener('click', downloadSavedCoursesPDF);
savedCoursesPrintBtn?.addEventListener('click', printSavedCourses);
savedCoursesCsvBtn?.addEventListener('click', () => downloadSavedCoursesData('csv'));
savedCoursesJsonBtn?.addEventListener('click', () => downloadSavedCoursesData('json'));
savedCoursesClearBtn?.addEventListener('click', clearSavedCourses);

// Expose public API
window.SiddhanCourse = {
  openCourseModal,
  closeCourseModal,
  openSavedCourses,
  openCourseCompare,
  filterCoursesByTool,
  openCareerWizard,
  downloadCoursePDF,
  extractCardData,
  extractTableRowData,
  initDynamicPortalLinks
};
window.downloadCoursePDF = downloadCoursePDF;
window.openCourseModal = openCourseModal;

// =============================================
// DYNAMIC PORTAL LINKS RESOLVER
// =============================================
function initDynamicPortalLinks() {
  try {
    const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    const isCourseFolder = path.includes('/course');
    
    const courseUrl = isCourseFolder ? 'index.html' : 'Course/index.html';
    const careerUrl = isCourseFolder ? '../Maac/index.html' : 'Maac/index.html';
    const hubUrl = isCourseFolder ? '../index.html' : 'index.html';

    document.querySelectorAll('[data-portal-link="course"]').forEach(el => {
      el.setAttribute('href', courseUrl);
    });
    document.querySelectorAll('[data-portal-link="career"]').forEach(el => {
      el.setAttribute('href', careerUrl);
    });
    document.querySelectorAll('[data-portal-link="hub"]').forEach(el => {
      el.setAttribute('href', hubUrl);
    });

    if (window.parent !== window) {
      document.querySelectorAll('[data-portal-link]').forEach(el => {
        el.addEventListener('click', event => {
          const view = el.dataset.portalLink;
          if (!['course', 'career', 'hub'].includes(view)) return;
          event.preventDefault();
          window.parent.postMessage({ type: 'siddhan-portal-navigate', view }, '*');
        });
      });
    }
  } catch (e) {
    console.warn('Dynamic portal links resolver error:', e);
  }
}

// =============================================
// INIT
// =============================================
initDynamicPortalLinks();
makeCourseTableToolsClickable();
if (sortSelect) sortSelect.value = 'code-az';
sortCourseViews('code-az');
applyFilters();
const initialSoftwareFilter = new URLSearchParams(window.location.search).get('software');
if (initialSoftwareFilter) filterCoursesByTool(initialSoftwareFilter);
