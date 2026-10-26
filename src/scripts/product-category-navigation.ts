const pendingCategoryKey = 'leanodm-products-pending-category';

export function setCategoryExpanded(disclosure: HTMLAnchorElement, open: boolean) {
  const children = document.getElementById(disclosure.getAttribute('aria-controls') ?? '');
  if (!children) return;
  disclosure.setAttribute('aria-expanded', String(open));
  children.hidden = !open;
}

/** Carry an explicit expansion across the overview's native category navigation. */
export function rememberCategoryExpansion(path: string) {
  try { sessionStorage.setItem(pendingCategoryKey, path); } catch { /* Navigation still works without storage. */ }
}

/** Consume once: direct visits and subsequent reloads keep the collapsed default. */
export function restoreCategoryExpansion(container: HTMLElement, currentPath: string): boolean {
  let pending: string | null;
  try {
    pending = sessionStorage.getItem(pendingCategoryKey);
    sessionStorage.removeItem(pendingCategoryKey);
  } catch { return false; }
  if (pending !== currentPath) return false;
  const disclosure = [...container.querySelectorAll<HTMLAnchorElement>('a[data-category-disclosure]')]
    .find(link => new URL(link.href).pathname === pending);
  if (disclosure) setCategoryExpanded(disclosure, true);
  return Boolean(disclosure);
}
