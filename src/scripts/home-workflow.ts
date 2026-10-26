const initializedWorkflows = new WeakSet<HTMLElement>();

/** Enhance the server-rendered steps without adding a slider or navigation controls. */
export function initHomeWorkflow(scope: ParentNode = document) {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-home-workflow]')) {
    if (initializedWorkflows.has(root)) continue;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-workflow-card]'));
    const entries = cards.map(card => ({
      card,
      trigger: card.querySelector<HTMLButtonElement>('[data-workflow-trigger]'),
      detail: card.querySelector<HTMLElement>('[data-workflow-detail]'),
    }));
    // An incomplete group keeps its readable, non-interactive fallback.
    if (!entries.length || entries.some(entry => !entry.trigger || !entry.detail)) continue;
    const hoverLayout = root.ownerDocument?.defaultView?.matchMedia('(min-width: 1101px) and (hover: hover)');

    let selected = -1;
    const select = (index: number) => {
      if (index === selected) return;
      const focused = root.ownerDocument?.activeElement;
      const focusInDetail = focused && entries.some(({ detail }) => detail!.contains(focused));
      selected = index;
      // A clicked preview must not leave keyboard focus inside a newly hidden panel.
      if (focusInDetail) entries[index].trigger!.focus({ preventScroll: true });
      entries.forEach(({ card, trigger, detail }, current) => {
        const active = current === index;
        card.classList.toggle('is-active', active);
        trigger!.setAttribute('aria-expanded', String(active));
        detail!.hidden = !active;
      });
    };

    entries.forEach(({ card, trigger }, index) => {
      card.addEventListener('pointerenter', event => {
        const focused = root.ownerDocument?.activeElement;
        const readingLink = focused && entries.some(({ detail }) => detail!.contains(focused));
        if (event.pointerType === 'mouse' && (hoverLayout?.matches ?? true) && !readingLink) select(index);
      });
      card.addEventListener('click', () => select(index));
      trigger!.addEventListener('focus', () => select(index));
    });
    select(0);
    root.dataset.workflowReady = 'true';
    initializedWorkflows.add(root);
  }
}
