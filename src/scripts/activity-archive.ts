import { readArchiveState, selectActivities, updateArchiveState, writeArchiveState, type ArchiveState, type SearchableActivity } from '../data/activity-filters';

const archive = document.querySelector<HTMLElement>('[data-activity-archive]');
const data = document.getElementById('activity-search-data');
if (archive && data) {
  const records: SearchableActivity[] = JSON.parse(data.textContent ?? '[]');
  const form = archive.querySelector<HTMLFormElement>('[data-archive-form]')!;
  const category = form.elements.namedItem('category') as HTMLSelectElement;
  const year = form.elements.namedItem('year') as HTMLSelectElement;
  const query = form.elements.namedItem('q') as HTMLInputElement;
  const cards = Array.from(archive.querySelectorAll<HTMLElement>('[data-activity-card]'));
  const pagination = archive.querySelector<HTMLElement>('[data-archive-pagination]')!;
  const pageNumbers = archive.querySelector<HTMLElement>('[data-page-numbers]')!;
  const previous = archive.querySelector<HTMLButtonElement>('[data-previous-page]')!;
  const next = archive.querySelector<HTMLButtonElement>('[data-next-page]')!;
  const resetEmpty = archive.querySelector<HTMLButtonElement>('[data-reset-empty]')!;
  let state = readArchiveState(location.search);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  function syncUrl(replace = false) {
    const search = writeArchiveState(state, location.search);
    const url = `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
    if (url !== `${location.pathname}${location.search}${location.hash}`) history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }
  function render(replace = false, focusPage = false) {
    const result = selectActivities(records, state);
    state = { ...state, page: result.page };
    // A well-formed but unavailable year should be visible and recoverable.
    if (!Array.from(year.options).some(option => option.value === state.year)) year.add(new Option(state.year, state.year));
    category.value = state.category; year.value = state.year; query.value = state.query;
    const visible = new Set(result.items.map(item => item.slug));
    cards.forEach(card => { card.hidden = !visible.has(card.dataset.activityCard ?? ''); });
    const first = result.total ? (result.page - 1) * 12 + 1 : 0;
    archive!.querySelector<HTMLElement>('[data-results-count]')!.textContent = result.total ? `Showing ${first}–${first + result.items.length - 1} of ${result.total} ${result.total === 1 ? 'story' : 'stories'}` : '0 stories';
    archive!.querySelector<HTMLElement>('[data-archive-empty]')!.hidden = result.total > 0;
    pagination.hidden = result.pages <= 1;
    previous.disabled = result.page <= 1; next.disabled = result.page >= result.pages;
    pageNumbers.replaceChildren();
    for (let page = 1; page <= result.pages; page++) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = String(page); button.dataset.page = String(page); button.setAttribute('aria-label', `Page ${page}`);
      if (page === result.page) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => change({ page }, true));
      pageNumbers.append(button);
    }
    document.querySelectorAll<HTMLElement>('[data-category-link]').forEach(link => {
      if (link.dataset.categoryLink === state.category) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    syncUrl(replace);
    if (focusPage) { const heading = document.getElementById('archive-title')!; heading.tabIndex = -1; heading.focus({ preventScroll: true }); archive!.scrollIntoView({ behavior: 'instant', block: 'start' }); }
  }
  function change(changes: Partial<ArchiveState>, focusPage = false) {
    if (searchTimer) { clearTimeout(searchTimer); searchTimer = undefined; }
    state = updateArchiveState(state, changes);
    render(false, focusPage);
  }
  function reset() { change({ category: 'all', year: 'all', query: '' }); }
  form.addEventListener('submit', event => { event.preventDefault(); change({ query: query.value.trim() }); });
  category.addEventListener('change', () => change({ category: category.value as ArchiveState['category'], query: query.value.trim() }));
  year.addEventListener('change', () => change({ year: year.value, query: query.value.trim() }));
  query.addEventListener('input', () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => change({ query: query.value }), 240); });
  form.addEventListener('reset', event => { event.preventDefault(); reset(); });
  resetEmpty.addEventListener('click', () => { reset(); query.focus(); });
  previous.addEventListener('click', () => change({ page: state.page - 1, ...(query.value.trim() !== state.query ? { query: query.value.trim() } : {}) }, true));
  next.addEventListener('click', () => change({ page: state.page + 1, ...(query.value.trim() !== state.query ? { query: query.value.trim() } : {}) }, true));
  document.querySelectorAll<HTMLAnchorElement>('[data-category-link]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); change({ category: link.dataset.categoryLink as ArchiveState['category'], query: query.value.trim() }); archive!.scrollIntoView({ block: 'start' });
  }));
  window.addEventListener('popstate', () => { if (searchTimer) clearTimeout(searchTimer); state = readArchiveState(location.search); render(true); });
  render(true);
  form.hidden = false;
}
