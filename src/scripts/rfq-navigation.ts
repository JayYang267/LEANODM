// RFQ-only enhancement: keep section controls and keyboard access without
// adding fragments to the address bar or changing any shared site components.
const isRfq = () => Boolean(document.querySelector('.rfq-page'));

function sectionId(fragment: string): string {
  try { return decodeURIComponent(fragment); } catch { return ''; }
}

function revealSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  if (!section.hasAttribute('tabindex')) {
    section.tabIndex = -1;
    section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
  }
  section.focus({ preventScroll: true });
  const headerHeight = ['.lean-global-header', '.technical-header'].reduce((height, selector) => height + (document.querySelector(selector)?.getBoundingClientRect().height ?? 0), 0);
  const top = Math.max(0, scrollY + section.getBoundingClientRect().top - headerHeight - 16);
  window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function cleanFragment() {
  if (!isRfq() || !location.hash) return;
  const id = sectionId(location.hash.slice(1));
  history.replaceState(history.state, '', location.pathname + location.search);
  if (id) revealSection(id);
}

function initializeNavigation() {
  if (!isRfq()) return;
  // The site's generic CTA offers both options. On this page it returns to
  // the introduction without reloading or clearing either form's inputs.
  document.querySelectorAll<HTMLAnchorElement>('.lean-global-contact').forEach(link => {
    link.setAttribute('href', location.pathname + location.search);
    link.dataset.rfqScrollTarget = 'main-content';
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
    try {
      const destination = new URL(link.href);
      if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== location.origin || destination.pathname.replace(/\/$/, '') !== location.pathname.replace(/\/$/, '') || !destination.hash) return;
      const id = sectionId(destination.hash.slice(1));
      destination.hash = '';
      link.setAttribute('href', destination.pathname + destination.search);
      if (id && destination.search === location.search && document.getElementById(id)) link.dataset.rfqScrollTarget = id;
    } catch { /* Invalid or non-navigation URLs are left alone. */ }
  });
  const incoming = document.documentElement.dataset.rfqInitialSection;
  delete document.documentElement.dataset.rfqInitialSection;
  cleanFragment();
  if (incoming) requestAnimationFrame(() => revealSection(sectionId(incoming)));
  document.querySelector<HTMLElement>('.rfq-page')!.dataset.hashlessNavigation = 'true';
}

document.addEventListener('click', event => {
  if (!isRfq() || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-rfq-scroll-target]') : null;
  if (!link || link.target === '_blank') return;
  event.preventDefault();
  for (let parent = link.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = false;
  }
  revealSection(link.dataset.rfqScrollTarget ?? '');
});

initializeNavigation();
document.addEventListener('astro:page-load', initializeNavigation);
window.addEventListener('hashchange', cleanFragment);
window.addEventListener('popstate', cleanFragment);
window.addEventListener('pageshow', cleanFragment);
