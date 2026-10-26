import { restoreCategoryExpansion, setCategoryExpanded } from './product-category-navigation';

const catalog = document.querySelector<HTMLElement>('[data-product-catalog]');

if (catalog) {
  const status = catalog.querySelector<HTMLElement>('[data-catalog-status]');
  let pending: AbortController | undefined;
  let currentPath = catalog.dataset.catalogPath ?? location.pathname;
  const normalize = (path: string) => `${path.replace(/\/+$/, '')}/`;

  function revealCatalogView(view: HTMLElement | null) {
    if (!view || !window.matchMedia('(max-width: 700px)').matches) return;
    const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lean-global-header-height')) || 72;
    window.scrollTo({ top: window.scrollY + view.getBoundingClientRect().top - headerHeight - 18, behavior: 'instant' });
  }

  if (restoreCategoryExpansion(catalog, catalog.dataset.catalogBasePath ?? currentPath)) {
    revealCatalogView(catalog.querySelector<HTMLElement>('[data-catalog-view]'));
  }

  // Keep the category shell, its scroll position and manually opened branches.
  function updateSelection(path: string) {
    catalog!.querySelectorAll<HTMLAnchorElement>('.catalog-sidebar a[data-catalog-link]').forEach(link => {
      if (normalize(new URL(link.href).pathname) === path) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  async function navigate(url: URL, push: boolean) {
    const path = normalize(url.pathname);
    if (path === currentPath) {
      pending?.abort();
      pending = undefined;
      catalog!.querySelector('[data-catalog-view]')?.removeAttribute('aria-busy');
      if (status) status.textContent = '';
      return;
    }
    pending?.abort();
    const request = new AbortController();
    pending = request;
    const currentView = catalog!.querySelector<HTMLElement>('[data-catalog-view]');
    currentView?.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Loading category…';
    try {
      const response = await fetch(url.href, { signal: request.signal, headers: { Accept: 'text/html' } });
      if (!response.ok) throw new Error('Category unavailable');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextView = doc.querySelector<HTMLElement>('[data-catalog-view]');
      const nextCatalog = doc.querySelector<HTMLElement>('[data-product-catalog]');
      if (!nextView || !nextCatalog) throw new Error('Invalid category page');
      if (request.signal.aborted) return;
      const focusInsideView = currentView?.contains(document.activeElement);
      currentView?.replaceWith(nextView);
      document.title = doc.title;
      for (const selector of ['meta[name="title"]', 'meta[name="description"]', 'meta[name="robots"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="twitter:title"]', 'meta[property="twitter:description"]', 'link[rel="canonical"]', '#catalog-schema']) {
        const next = doc.head.querySelector(selector);
        const previous = document.head.querySelector(selector);
        if (next && previous) previous.replaceWith(next);
      }
      for (const relation of ['prev', 'next']) {
        const selector = `link[rel="${relation}"]`;
        const next = doc.head.querySelector(selector);
        const previous = document.head.querySelector(selector);
        if (next && previous) previous.replaceWith(next);
        else if (next) document.head.append(next);
        else previous?.remove();
      }
      if (push) history.pushState({ catalog: true }, '', url.href);
      currentPath = path;
      catalog!.dataset.catalogPath = path;
      const basePath = nextCatalog.dataset.catalogBasePath ?? path;
      catalog!.dataset.catalogBasePath = basePath;
      updateSelection(basePath);
      // Sidebar links retain focus; replacing a focused content link moves focus
      // to the selected heading. Mobile brings the content into view immediately.
      const heading = nextView.querySelector<HTMLElement>('#catalog-selection-title');
      if (focusInsideView) heading?.focus({ preventScroll: true });
      revealCatalogView(nextView);
      const itemCount = nextView.querySelectorAll('[data-product-listing-card]').length;
      if (status) status.textContent = `${heading?.textContent ?? 'Category'} loaded. ${itemCount ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} shown.` : 'No products listed yet.'}`;
    } catch (error) {
      if (request.signal.aborted) return;
      // A failed enhancement uses the same real, independently rendered URL.
      if (status) status.textContent = 'Opening category page…';
      location.assign(url.href);
    } finally {
      if (pending === request) {
        catalog!.querySelector('[data-catalog-view]')?.removeAttribute('aria-busy');
        pending = undefined;
      }
    }
  }

  catalog.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[data-catalog-link]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/products/') || url.hash || url.search) return;
    // The product overview has its own image-led layout, outside this category shell.
    if (normalize(url.pathname) === '/products/') return;
    event.preventDefault();
    if (link.hasAttribute('data-category-disclosure')) {
      const selectsNewPage = normalize(url.pathname) !== currentPath;
      setCategoryExpanded(link, selectsNewPage || link.getAttribute('aria-expanded') !== 'true');
      void navigate(url, true);
      return;
    }
    void navigate(url, true);
  });

  catalog.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-category-disclosure]') : null;
    if (link) {
      event.preventDefault();
      if (!event.repeat) setCategoryExpanded(link, link.getAttribute('aria-expanded') !== 'true');
    }
  });

  window.addEventListener('popstate', () => {
    if (location.pathname.startsWith('/products/')) void navigate(new URL(location.href), false);
  });
}
