/** Decorative playback is optional; the complete film is loaded only on request. */
export function initFactoryVideo() {
  const hero = document.querySelector<HTMLElement>('[data-factory-hero]');
  const background = hero?.querySelector<HTMLVideoElement>('[data-factory-background]');
  const watch = hero?.querySelector<HTMLAnchorElement>('[data-factory-watch]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-factory-dialog]');
  const film = dialog?.querySelector<HTMLVideoElement>('[data-factory-film]');
  const close = dialog?.querySelector<HTMLButtonElement>('[data-factory-close]');
  const filmError = dialog?.querySelector<HTMLElement>('[data-factory-film-error]');
  if (!hero || !background || !watch || !dialog || !film || !close) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let enabled = !motion.matches && !connection?.saveData;
  let failed = false;
  const initialRect = background.getBoundingClientRect();
  let inView = initialRect.bottom > 0 && initialRect.top < innerHeight;
  let playPending = false;
  background.muted = true;
  const synchronize = () => {
    const shouldPlay = enabled && !failed && inView && !document.hidden && !dialog.open;
    if (!shouldPlay) {
      background.pause();
      return;
    }
    if (!background.getAttribute('src')) {
      background.src = matchMedia('(max-width: 760px)').matches ? background.dataset.mobileSource! : background.dataset.desktopSource!;
      background.load();
    }
    if (playPending || !background.paused) return;
    playPending = true;
    background.play().then(() => {
      playPending = false;
      // A preference, visibility or dialog may have changed while loading.
      if (!enabled || !inView || document.hidden || dialog.open) background.pause();
    }).catch(() => {
      playPending = false;
      // Keep the poster visible if the browser blocks background autoplay.
    });
  };
  background.addEventListener('playing', () => { hero.dataset.videoState = 'playing'; });
  background.addEventListener('pause', () => {
    if (background.readyState >= 2 && !failed) hero.dataset.videoState = 'paused';
  });
  background.addEventListener('error', () => {
    failed = true;
    background.pause();
    hero.dataset.videoState = 'error';
  });
  motion.addEventListener('change', () => {
    enabled = !motion.matches && !connection?.saveData;
    synchronize();
  });
  document.addEventListener('visibilitychange', synchronize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; synchronize(); }, { threshold: 0 }).observe(background);
  }
  if (typeof dialog.showModal === 'function') {
    film.addEventListener('error', () => { if (filmError) filmError.hidden = false; });
    film.addEventListener('loadeddata', () => { if (filmError) filmError.hidden = true; });
    watch.addEventListener('click', event => {
      event.preventDefault();
      dialog.showModal();
      synchronize();
      if (!film.getAttribute('src')) { film.src = film.dataset.source!; film.load(); }
      film.play().catch(() => { /* Native controls remain available. */ });
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      film.pause();
      synchronize();
      watch.focus({ preventScroll: true });
    });
  }
  synchronize();
}
