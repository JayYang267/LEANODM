const dialog = document.querySelector<HTMLDialogElement>('.image-lightbox');
if (dialog && typeof dialog.showModal === 'function') {
  const find = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;
  const picture = find<HTMLImageElement>('[data-full-image]');
  const stage = find<HTMLDivElement>('.image-viewer-stage');
  const previous = find<HTMLButtonElement>('[data-previous]');
  const next = find<HTMLButtonElement>('[data-next]');
  const plus = find<HTMLButtonElement>('[data-plus]');
  const minus = find<HTMLButtonElement>('[data-minus]');
  let group: HTMLAnchorElement[] = [];
  let index = 0, width = 1, height = 1, zoom = 1, minimum = 1;
  let opener: HTMLAnchorElement | null = null;
  let readingX = 0, readingY = 0, bodyStyle: string | null = null;

  function resizeImage(value: number) {
    zoom = Math.min(1, Math.max(minimum, value));
    picture.style.width = `${Math.floor(width * zoom)}px`;
    picture.style.height = `${Math.floor(height * zoom)}px`;
    find<HTMLOutputElement>('[data-zoom]').value = `${Math.round(zoom * 100)}%`;
    plus.disabled = zoom >= .999;
    minus.disabled = zoom <= minimum + .001;
  }
  function fit() {
    minimum = Math.min(1, Math.max(1, stage.clientWidth - 32) / width, Math.max(1, stage.clientHeight - 32) / height);
    resizeImage(minimum);
    stage.scrollTo(0, 0);
  }
  function show(indexToShow: number) {
    index = indexToShow;
    const anchor = group[index];
    width = Number(anchor.dataset.width);
    height = Number(anchor.dataset.height);
    find('[data-image-error]').hidden = true;
    find('#image-viewer-title').textContent = anchor.dataset.title || 'Image viewer';
    find('#image-viewer-caption').textContent = anchor.dataset.caption || '';
    find('[data-source]').textContent = anchor.dataset.source || '';
    find('[data-counter]').textContent = `${index + 1} / ${group.length}`;
    find<HTMLAnchorElement>('[data-original]').href = anchor.href;
    picture.alt = anchor.querySelector('img')?.alt || anchor.dataset.title || '';
    picture.width = width;
    picture.height = height;
    // Only the current item is requested. Do not preload neighbors or entire groups.
    picture.src = anchor.href;
    previous.disabled = index === 0;
    next.disabled = index === group.length - 1;
    fit();
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest<HTMLAnchorElement>('a[data-lightbox]');
    if (!anchor) return;
    event.preventDefault();
    opener = anchor;
    group = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]'))
      .filter(item => item.dataset.lightbox === anchor.dataset.lightbox)
      .filter((item, position, items) => items.findIndex(entry => entry.href === item.href) === position);
    readingX = window.scrollX; readingY = window.scrollY;
    bodyStyle = document.body.getAttribute('style');
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, { position: 'fixed', top: `-${readingY}px`, left: `-${readingX}px`, width: '100%', paddingRight: `${scrollbar}px` });
    dialog.showModal();
    show(group.findIndex(item => item.href === anchor.href));
    find<HTMLButtonElement>('[data-close]').focus();
  });
  find('[data-close]').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => { if (index > 0) show(index - 1); });
  next.addEventListener('click', () => { if (index < group.length - 1) show(index + 1); });
  plus.addEventListener('click', () => resizeImage(zoom + .2));
  minus.addEventListener('click', () => resizeImage(zoom - .2));
  find('[data-fit]').addEventListener('click', fit);
  find('[data-native]').addEventListener('click', () => resizeImage(1));
  picture.addEventListener('error', () => { find('[data-image-error]').hidden = false; });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    // Arrow keys navigate at fit size; at native size they remain available for panning.
    if (event.key === 'ArrowLeft' && zoom <= minimum + .001 && index > 0) { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight' && zoom <= minimum + .001 && index < group.length - 1) { event.preventDefault(); show(index + 1); }
  });
  dialog.addEventListener('close', () => {
    if (bodyStyle === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', bodyStyle);
    opener?.focus({ preventScroll: true });
    window.scrollTo({ left: readingX, top: readingY, behavior: 'instant' });
    picture.removeAttribute('src');
  });
  window.addEventListener('resize', () => { if (dialog.open) fit(); });
}

// Make direct links to examples inside collapsed groups useful on first load and later navigation.
function revealHash() {
  let id: string;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  let parent: HTMLElement | null = target;
  let revealed = false;
  while (parent) {
    if (parent instanceof HTMLDetailsElement && !parent.open) { parent.open = true; revealed = true; }
    parent = parent.parentElement;
  }
  if (revealed) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
revealHash();
window.addEventListener('hashchange', revealHash);
