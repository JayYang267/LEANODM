const initializedRoots = new WeakSet<HTMLElement>();

/** A manual image-and-copy carousel, beginning with Manufacturing 3.0. */
export function initManufacturingEras(scope: ParentNode = document) {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-manufacturing-eras]')) {
    if (initializedRoots.has(root)) continue;

    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-era-card]'));
    const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-era-trigger]'));
    const track = root.querySelector<HTMLElement>('[data-era-track]');
    const viewport = root.querySelector<HTMLElement>('[data-era-viewport]');
    const previous = root.querySelector<HTMLButtonElement>('[data-era-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-era-next]');
    const status = root.querySelector<HTMLElement>('[data-era-status]');
    if (!track || !viewport || !previous || !next || cards.length < 2 || triggers.length !== cards.length) continue;

    const configuredDefault = Number(root.dataset.defaultEra);
    let active = Number.isInteger(configuredDefault) && configuredDefault >= 0 && configuredDefault < cards.length ? configuredDefault : cards.length - 1;
    let position = active + 1;
    let boundaryPending = false;
    let moving = false;
    let movementTimer: ReturnType<typeof setTimeout> | undefined;

    // Boundary copies let 3.0 -> 1.0 and 1.0 -> 3.0 move only one panel.
    const boundaryCopy = (card: HTMLElement) => {
      const copy = card.cloneNode(true) as HTMLElement;
      copy.removeAttribute('data-era-card');
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      copy.setAttribute('data-era-clone', '');
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      copy.classList.add('is-active');
      return copy;
    };
    track.prepend(boundaryCopy(cards[cards.length - 1]));
    track.append(boundaryCopy(cards[0]));

    const setOffset = (offset = 0) => {
      track.style.transform = `translateX(calc(${-position * 100}% + ${offset}px))`;
    };
    const settleBoundary = () => {
      if (!boundaryPending) return;
      boundaryPending = false;
      position = active + 1;
      root.classList.add('is-resetting');
      setOffset();
      // Commit the identical real panel without animating the invisible reset.
      track.getBoundingClientRect();
      root.classList.remove('is-resetting');
    };
    const finishMovement = () => {
      if (movementTimer !== undefined) clearTimeout(movementTimer);
      movementTimer = undefined;
      settleBoundary();
      moving = false;
    };
    const select = (index: number, announce = true) => {
      // Let the current panel arrive before accepting another navigation or drag.
      if (moving) return;
      settleBoundary();
      active = (index + cards.length) % cards.length;
      position = index === cards.length ? cards.length + 1 : index === -1 ? 0 : active + 1;
      boundaryPending = position === 0 || position === cards.length + 1;
      root.dataset.activeEra = String(active);
      cards.forEach((card, cardIndex) => {
        const selected = cardIndex === active;
        card.classList.toggle('is-active', selected);
        card.setAttribute('aria-hidden', String(!selected));
        card.inert = !selected;
        triggers[cardIndex].classList.toggle('is-active', selected);
        triggers[cardIndex].setAttribute('aria-pressed', String(selected));
      });
      const previousTransform = track.style.transform;
      setOffset();
      if (announce && status) status.textContent = cards[active].querySelector('h3')?.textContent?.trim() || `Manufacturing approach ${active + 1}`;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.classList.contains('is-ready') || previousTransform === track.style.transform) {
        settleBoundary();
      } else {
        moving = true;
        // A hidden tab or interrupted transition may not deliver transitionend.
        movementTimer = setTimeout(finishMovement, 600);
      }
    };

    track.addEventListener('transitionend', event => {
      if (event.target === track && event.propertyName === 'transform') finishMovement();
    });
    track.addEventListener('transitioncancel', event => {
      if (event.target === track && event.propertyName === 'transform') finishMovement();
    });
    triggers.forEach((trigger, index) => trigger.addEventListener('click', () => select(index)));
    previous.addEventListener('click', () => select(active - 1));
    next.addEventListener('click', () => select(active + 1));
    root.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const destinations: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      select(destinations[event.key]);
    });

    let gesture: { pointer: number; x: number; y: number; offset: number; horizontal: boolean } | undefined;
    viewport.addEventListener('pointerdown', event => {
      if (moving || gesture || !event.isPrimary || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return;
      settleBoundary();
      gesture = { pointer: event.pointerId, x: event.clientX, y: event.clientY, offset: 0, horizontal: false };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if (!gesture || gesture.pointer !== event.pointerId) return;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      if (!gesture.horizontal && Math.abs(x) > 10 && Math.abs(x) > Math.abs(y) * 1.2) {
        gesture.horizontal = true;
        root.classList.add('is-dragging');
      }
      if (!gesture.horizontal) return;
      event.preventDefault();
      gesture.offset = x;
      const limit = viewport.clientWidth * .4;
      setOffset(Math.max(-limit, Math.min(limit, x)));
    });
    const finishGesture = (event: PointerEvent, cancelled = false) => {
      if (!gesture || gesture.pointer !== event.pointerId) return;
      const completed = gesture;
      gesture = undefined;
      root.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      const threshold = Math.min(60, viewport.clientWidth * .16);
      if (!cancelled && completed.horizontal && Math.abs(completed.offset) >= threshold) select(active + (completed.offset < 0 ? 1 : -1));
      else select(active, false);
    };
    viewport.addEventListener('pointerup', event => finishGesture(event));
    viewport.addEventListener('pointercancel', event => finishGesture(event, true));

    root.classList.add('is-enhanced');
    select(active, false);
    requestAnimationFrame(() => root.classList.add('is-ready'));
    initializedRoots.add(root);
  }
}
