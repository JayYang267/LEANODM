import { rememberCategoryExpansion, setCategoryExpanded } from './product-category-navigation';

const sidebar = document.querySelector<HTMLElement>('[data-products-sidebar]');

if (sidebar) {
  const panel = sidebar.querySelector<HTMLDetailsElement>('[data-products-category-panel]');
  const compact = window.matchMedia('(max-width: 900px)');
  const setPanelLayout = () => { if (panel) panel.open = !compact.matches; };
  setPanelLayout();
  compact.addEventListener('change', setPanelLayout);

  sidebar.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const disclosure = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('[data-category-disclosure]')
      : null;
    if (!disclosure || disclosure.target || disclosure.hasAttribute('download')) return;
    const url = new URL(disclosure.href);
    if (url.origin !== location.origin) return;
    setCategoryExpanded(disclosure, true);
    rememberCategoryExpansion(url.pathname);
  });

  sidebar.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const disclosure = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('[data-category-disclosure]')
      : null;
    if (!disclosure) return;
    event.preventDefault();
    if (!event.repeat) setCategoryExpanded(disclosure, disclosure.getAttribute('aria-expanded') !== 'true');
  });
}
