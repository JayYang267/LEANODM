const initialized = new WeakSet<HTMLElement>();

export function initHomeCustomers(root: ParentNode = document) {
  for (const section of root.querySelectorAll<HTMLElement>('[data-home-customers]')) {
    if (initialized.has(section)) continue;
    const items = Array.from(section.querySelectorAll<HTMLElement>('[data-customer-item]'));
    const triggers = items.map(item => item.querySelector<HTMLButtonElement>('[data-customer-trigger]'));
    const panels = items.map(item => item.querySelector<HTMLElement>('[data-customer-panel]'));
    if (!items.length || triggers.some(trigger => !trigger) || panels.some(panel => !panel)) continue;

    const inline = window.matchMedia('(max-width: 1100px)');
    let selected = 0;
    const select = (index: number) => {
      selected = index;
      items.forEach((item, itemIndex) => {
        const active = itemIndex === index;
        item.classList.toggle('is-active', active);
        triggers[itemIndex]!.setAttribute('aria-expanded', String(active));
        panels[itemIndex]!.hidden = !active;
      });
    };

    triggers.forEach((trigger, index) => {
      trigger!.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse' && !inline.matches) select(index);
      });
      trigger!.addEventListener('click', () => {
        select(inline.matches && selected === index ? -1 : index);
      });
      trigger!.addEventListener('keydown', event => {
        let next: number;
        if (event.key === 'ArrowDown') next = (index + 1) % items.length;
        else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        triggers[next]!.focus();
        select(next);
      });
    });
    inline.addEventListener('change', () => {
      if (!inline.matches && selected < 0) select(0);
    });

    select(0);
    section.classList.add('is-ready');
    initialized.add(section);
  }
}
