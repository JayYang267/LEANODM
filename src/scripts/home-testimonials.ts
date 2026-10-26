const initialized = new WeakSet<HTMLElement>();
const ROTATION_DELAY = 7000;

/** A manual-friendly review rail: one card every seven seconds while visible. */
export function initTestimonials(scope: ParentNode = document) {
  for (const section of scope.querySelectorAll<HTMLElement>('[data-testimonials]')) {
    if (initialized.has(section)) continue;
    const track = section.querySelector<HTMLElement>('[data-review-track]');
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-review-card]'));
    const dots = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-review-index]'));
    const arrows = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-review-direction]'));
    if (!track || cards.length < 2) continue;

    const controller = new AbortController();
    const options = { signal: controller.signal };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let hovered = false;
    let focused = false;
    let interacting = false;
    let moving = false;
    let targetPosition: number | undefined;
    let disposed = false;
    let timer: number | undefined;
    let settleTimer: number | undefined;
    let resizeFrame = 0;
    const initial = section.getBoundingClientRect();
    let inView = initial.bottom > 0 && initial.top < window.innerHeight;

    const copies = cards.map(card => {
      const copy = card.cloneNode(true) as HTMLElement;
      copy.removeAttribute('id');
      copy.removeAttribute('data-review-card');
      copy.removeAttribute('aria-labelledby');
      copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-review-clone', '');
      copy.inert = true;
      track.append(copy);
      return copy;
    });

    const step = () => cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    const clearRotation = () => { window.clearTimeout(timer); timer = undefined; };
    const clearSettling = () => { window.clearTimeout(settleTimer); settleTimer = undefined; };
    const update = () => {
      dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
    };
    const schedule = () => {
      clearRotation();
      if (!section.isConnected) { dispose(); return; }
      if (!disposed && !motion.matches && !hovered && !focused && !interacting && !moving && inView && !document.hidden) {
        timer = window.setTimeout(() => moveTo(current + 1), ROTATION_DELAY);
      }
    };
    const settle = () => {
      if (interacting || disposed) return;
      const distance = step();
      if (distance <= 0) return;
      // Ignore scrollend from the instant duplicate jump until the requested slide arrives.
      if (moving && targetPosition !== undefined && Math.abs(track.scrollLeft - targetPosition) > 1) return;
      clearSettling();
      const span = distance * cards.length;
      // The first duplicate is visually identical to the start of the real rail.
      if (track.scrollLeft >= span - 1) {
        track.scrollTo({ left: track.scrollLeft - span, behavior: 'instant' });
      }
      current = ((Math.round(track.scrollLeft / distance) % cards.length) + cards.length) % cards.length;
      moving = false;
      targetPosition = undefined;
      update();
      schedule();
    };
    const moveTo = (index: number) => {
      clearRotation();
      clearSettling();
      const distance = step();
      if (distance <= 0) { update(); schedule(); return; }
      const target = index === cards.length ? cards.length : ((index % cards.length) + cards.length) % cards.length;
      // Start from the identical duplicate group so Previous also slides left at the loop boundary.
      if (index < 0) track.scrollTo({ left: cards.length * distance, behavior: 'instant' });
      current = target % cards.length;
      moving = true;
      targetPosition = target * distance;
      update();
      track.scrollTo({ left: targetPosition, behavior: motion.matches ? 'instant' : 'smooth' });
      // scrollend is supported by modern browsers; debounce/fallback covers others.
      settleTimer = window.setTimeout(settle, motion.matches ? 0 : 1000);
    };
    const pauseForInteraction = () => {
      moving = false;
      targetPosition = undefined;
      clearRotation();
      clearSettling();
      track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
      update();
      if (!interacting) settleTimer = window.setTimeout(settle, 140);
    };

    dots.forEach((dot, index) => dot.addEventListener('click', () => moveTo(index), options));
    arrows.forEach(arrow => arrow.addEventListener('click', () => {
      const direction = arrow.dataset.reviewDirection === '-1' ? -1 : 1;
      moveTo(current + direction);
    }, options));
    section.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      schedule();
    }, options);
    section.addEventListener('pointerleave', event => {
      if (event.pointerType === 'touch') return;
      hovered = false;
      schedule();
    }, options);
    section.addEventListener('focusin', () => { focused = true; schedule(); }, options);
    section.addEventListener('focusout', event => {
      focused = !!event.relatedTarget && section.contains(event.relatedTarget as Node);
      schedule();
    }, options);
    section.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1 };
      if (!(event.key in target)) return;
      event.preventDefault();
      moveTo(target[event.key]);
    }, options);
    track.addEventListener('pointerdown', () => { interacting = true; pauseForInteraction(); }, options);
    const release = () => { if (!interacting) return; interacting = false; settle(); };
    window.addEventListener('pointerup', release, options);
    window.addEventListener('pointercancel', release, options);
    track.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || (event.shiftKey && event.deltaY !== 0)) pauseForInteraction();
    }, { ...options, passive: true });
    track.addEventListener('scroll', () => {
      clearSettling();
      settleTimer = window.setTimeout(settle, 140);
    }, { ...options, passive: true });
    track.addEventListener('scrollend', settle, options);
    document.addEventListener('visibilitychange', schedule, options);
    motion.addEventListener('change', schedule, options);
    window.addEventListener('resize', () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        moving = false;
        targetPosition = undefined;
        clearSettling();
        track.scrollTo({ left: current * step(), behavior: 'instant' });
        schedule();
      });
    }, options);

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    }, { threshold: 0 }) : undefined;
    observer?.observe(section);
    if (!observer) window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight;
      schedule();
    }, { ...options, passive: true });
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      clearRotation();
      clearSettling();
      window.cancelAnimationFrame(resizeFrame);
      observer?.disconnect();
      controller.abort();
      copies.forEach(copy => copy.remove());
      initialized.delete(section);
    };
    document.addEventListener('astro:before-swap', dispose, options);
    window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, options);

    track.setAttribute('aria-live', 'off');
    track.tabIndex = 0;
    section.classList.add('reviews-ready');
    initialized.add(section);
    track.scrollTo({ left: 0, behavior: 'instant' });
    update();
    schedule();
  }
}
