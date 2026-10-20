/** A compositor-driven, seamless rail; the original six cards stay in the document. */
export function initHomeAwards() {
  for (const section of document.querySelectorAll<HTMLElement>('[data-awards]')) {
    if (section.classList.contains('is-ready')) continue;
    const viewport = section.querySelector<HTMLElement>('.xyh-awards-window');
    const track = section.querySelector<HTMLElement>('.xyh-awards-track');
    const original = section.querySelector<HTMLElement>('[data-awards-original]');
    if (!viewport || !track || !original) continue;

    const copy = original.cloneNode(true) as HTMLElement;
    copy.removeAttribute('data-awards-original');
    copy.setAttribute('data-awards-copy', '');
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    track.append(copy);

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const hoverInput = matchMedia('(hover: hover)');
    const pixelsPerSecond = 22;
    let animation: Animation | undefined;
    let duration = 1;
    let lastWidth = 0;
    let visible = false;
    let hovered = hoverInput.matches && viewport.matches(':hover');
    let focused = viewport.contains(document.activeElement);
    let touching = false;
    let readingUntil = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    let gesture: { id: number; x: number; time: number } | undefined;

    const syncPlayback = () => {
      const paused = reducedMotion.matches || !visible || document.hidden || hovered || focused || touching || Date.now() < readingUntil;
      if (paused) animation?.pause(); else animation?.play();
    };
    const wrapTime = (time: number) => ((time % duration) + duration) % duration;
    const measure = () => {
      section.classList.toggle('is-static', reducedMotion.matches);
      if (reducedMotion.matches) {
        animation?.cancel();
        animation = undefined;
        lastWidth = 0;
        return;
      }
      const phase = animation ? wrapTime(Number(animation.currentTime) || 0) / duration : 0;
      animation?.cancel();
      const style = getComputedStyle(section);
      const columns = Number(style.getPropertyValue('--award-columns')) || 3;
      const gap = parseFloat(style.getPropertyValue('--award-gap')) || 24;
      lastWidth = viewport.clientWidth;
      viewport.style.setProperty('--award-card-width', `${(lastWidth - gap * (columns - 1)) / columns}px`);
      const distance = original.getBoundingClientRect().width;
      if (!distance) return;
      duration = distance / pixelsPerSecond * 1000;
      animation = track.animate([
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(-${distance}px, 0, 0)` },
      ], { duration, iterations: Infinity, easing: 'linear' });
      animation.pause();
      animation.currentTime = phase * duration;
      syncPlayback();
    };
    const pauseToRead = () => {
      readingUntil = Date.now() + 8000;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(syncPlayback, 8050);
      syncPlayback();
    };

    viewport.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !hoverInput.matches) return;
      hovered = true;
      syncPlayback();
    });
    viewport.addEventListener('pointerleave', () => { hovered = false; syncPlayback(); });
    viewport.addEventListener('focusin', () => { focused = true; syncPlayback(); });
    viewport.addEventListener('focusout', event => {
      focused = event.relatedTarget instanceof Node && viewport.contains(event.relatedTarget);
      syncPlayback();
    });
    viewport.addEventListener('keydown', event => {
      if (!animation || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const step = original.getBoundingClientRect().width / original.children.length;
      animation.currentTime = wrapTime((Number(animation.currentTime) || 0) + (event.key === 'ArrowRight' ? 1 : -1) * step / pixelsPerSecond * 1000);
    });
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || !animation) return;
      gesture = { id: event.pointerId, x: event.clientX, time: Number(animation.currentTime) || 0 };
      touching = true;
      syncPlayback();
    });
    viewport.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId || !animation) return;
      const delta = event.clientX - gesture.x;
      if (Math.abs(delta) < 6) return;
      viewport.setPointerCapture(event.pointerId);
      animation.currentTime = wrapTime(gesture.time - delta / pixelsPerSecond * 1000);
    });
    const finishGesture = () => {
      if (!gesture) return;
      gesture = undefined;
      touching = false;
      pauseToRead();
    };
    viewport.addEventListener('pointerup', finishGesture);
    viewport.addEventListener('pointercancel', finishGesture);
    viewport.addEventListener('lostpointercapture', finishGesture);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', measure);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncPlayback(); }, { threshold: 0.05 });
    observer.observe(section);
    const resize = new ResizeObserver(() => { if (viewport.clientWidth !== lastWidth) measure(); });
    resize.observe(viewport);
    section.classList.add('is-ready');
    measure();
    document.addEventListener('astro:before-swap', () => {
      animation?.cancel();
      clearTimeout(resumeTimer);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', measure);
    }, { once: true });
  }
}
