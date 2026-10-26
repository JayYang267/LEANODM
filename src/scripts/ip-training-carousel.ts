const initialized = new WeakSet<HTMLElement>();

export function initIPTrainingCarousel(root: ParentNode = document) {
  for (const carousel of root.querySelectorAll<HTMLElement>('[data-ip-carousel]')) {
    if (initialized.has(carousel)) continue;
    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-ip-activity]'));
    const buttons = Array.from(carousel.querySelectorAll<HTMLButtonElement>('[data-ip-photo-direction]'));
    const controls = carousel.querySelector<HTMLElement>('[data-ip-carousel-controls]');
    const status = carousel.querySelector<HTMLElement>('[data-ip-carousel-status]');
    if (slides.length < 2 || buttons.length !== 2 || !controls) continue;

    const titles = slides.map(slide => slide.querySelector('.ip-activity-title')?.textContent?.trim() ?? 'Training photograph');
    const interval = Number(carousel.dataset.interval) || 3000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewer = document.querySelector<HTMLDialogElement>('.image-lightbox');
    let index = 0;
    let visible = false;
    let hovered = false;
    const hasKeyboardFocus = () => document.activeElement instanceof HTMLElement && carousel.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    let focused = hasKeyboardFocus();
    let timer: number | undefined;

    const hasSlideFocus = () => slides.some(slide => slide.contains(document.activeElement));
    const canRotate = () => visible && !hovered && !focused && !hasSlideFocus() && !document.hidden && !reducedMotion.matches && !viewer?.open;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = undefined;
      carousel.dataset.autoplay = canRotate() ? 'playing' : 'paused';
      if (!canRotate()) return;
      timer = window.setTimeout(() => {
        if (canRotate()) select((index + 1) % slides.length);
        else schedule();
      }, interval);
    };

    const select = (next: number, manual = false) => {
      index = next;
      carousel.dataset.activeIndex = String(index);
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${i + 1} of ${slides.length}: ${titles[i]}`);
        slide.inert = !active;
      });
      if (manual && status) status.textContent = `Photograph ${index + 1} of ${slides.length}: ${titles[index]}.`;
      schedule();
    };

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        focused = hasKeyboardFocus();
        const direction = Number(button.dataset.ipPhotoDirection);
        select((index + direction + slides.length) % slides.length, true);
      });
      button.addEventListener('keydown', event => {
        let next: number;
        if (event.key === 'ArrowRight') next = (index + 1) % slides.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + slides.length) % slides.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = slides.length - 1;
        else return;
        event.preventDefault();
        focused = true;
        select(next, true);
      });
    });
    carousel.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      schedule();
    });
    carousel.addEventListener('pointerleave', () => {
      hovered = false;
      schedule();
    });
    carousel.addEventListener('focusin', () => {
      focused = hasKeyboardFocus();
      schedule();
    });
    carousel.addEventListener('focusout', event => {
      focused = event.relatedTarget instanceof HTMLElement && carousel.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
    if (viewer) new MutationObserver(schedule).observe(viewer, { attributes: true, attributeFilter: ['open'] });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .25;
      schedule();
    }, { threshold: [0, .25] }).observe(carousel);

    carousel.setAttribute('aria-roledescription', 'carousel');
    controls.hidden = false;
    select(0);
    carousel.classList.add('is-ready');
    initialized.add(carousel);
  }
}
