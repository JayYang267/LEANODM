const initializedRoots = new WeakSet<HTMLElement>();

/** User-controlled era details; the third era is the resting state. */
export function initManufacturingEras(scope: ParentNode = document) {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-manufacturing-eras]')) {
    if (initializedRoots.has(root)) continue;

    const entries = Array.from(root.querySelectorAll<HTMLElement>('[data-era-card]')).map(card => ({
      card,
      trigger: card.querySelector<HTMLButtonElement>('[data-era-trigger]'),
      detail: card.querySelector<HTMLElement>('[data-era-detail]'),
    }));
    if (entries.length < 3 || entries.some(entry => !entry.trigger || !entry.detail)) continue;

    const defaultEra = 2;
    const select = (index: number) => {
      root.dataset.activeEra = String(index);
      entries.forEach(({ card, trigger, detail }, itemIndex) => {
        const active = itemIndex === index;
        card.classList.toggle('is-active', active);
        trigger!.setAttribute('aria-expanded', String(active));
        detail!.hidden = !active;
      });
    };

    entries.forEach(({ card, trigger }, index) => {
      card.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') select(index);
      });
      trigger!.addEventListener('focus', () => select(index));
      card.addEventListener('click', () => select(index));
    });
    root.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') select(defaultEra);
    });
    root.addEventListener('focusout', event => {
      if (!root.contains(event.relatedTarget as Node | null)) select(defaultEra);
    });

    select(defaultEra);
    root.classList.add('is-enhanced');
    initializedRoots.add(root);
  }
}
