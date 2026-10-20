const productPage = document.querySelector<HTMLElement>('[data-product-page]');
if (productPage) {
  const mainLink = productPage.querySelector<HTMLAnchorElement>('[data-main-image]');
  const mainImage = mainLink?.querySelector('img');
  const thumbs = productPage.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]');
  thumbs.forEach(thumb => thumb.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !mainLink || !mainImage) return;
    event.preventDefault();
    const d = thumb.dataset;
    mainLink.href = thumb.href;
    for (const key of ['width', 'height', 'caption']) mainLink.dataset[key] = d[key];
    mainLink.dataset.title = d.label;
    mainImage.src = thumb.href;
    mainImage.alt = d.alt || '';
    mainImage.width = Number(d.width);
    mainImage.height = Number(d.height);
    thumbs.forEach(item => item.removeAttribute('aria-current'));
    thumb.setAttribute('aria-current', 'true');
    const caption = productPage.querySelector('[data-gallery-caption]');
    if (caption) caption.textContent = d.caption || '';
  }));
  const data = productPage.querySelector('[data-customization-data]');
  const options = JSON.parse(data?.textContent || '[]') as { id: string; label: string; note: string }[];
  const updateSelection = () => {
    const selected = Array.from(productPage.querySelectorAll<HTMLInputElement>('input[name="customization"]:checked'));
    const count = productPage.querySelector('[data-selection-count]');
    const intro = productPage.querySelector('[data-selection-intro]');
    const list = productPage.querySelector('[data-selection-notes]');
    if (count) count.textContent = selected.length ? `${selected.length} customization ${selected.length === 1 ? 'area' : 'areas'} in your brief` : 'Your customization brief';
    if (intro) intro.textContent = selected.length ? 'These choices are carried into your inquiry. Review the sample and engineering implications:' : 'Select an area to see what needs review. Your selections will be included in the inquiry below.';
    list?.replaceChildren(...selected.map(input => {
      const option = options.find(item => item.id === input.dataset.optionId);
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${option?.label}: `;
      li.append(strong, option?.note || 'Review this option with your project brief.');
      return li;
    }));
  };
  productPage.querySelectorAll<HTMLInputElement>('input[name="customization"]').forEach(input => input.addEventListener('change', updateSelection));
  const updatePathway = () => {
    const active = productPage.querySelector<HTMLInputElement>('input[name="pathway"]:checked')?.value;
    productPage.querySelectorAll<HTMLElement>('[data-pathway-panel]').forEach(panel => { panel.hidden = panel.dataset.pathwayPanel !== active; });
  };
  productPage.querySelectorAll<HTMLInputElement>('input[name="pathway"]').forEach(input => input.addEventListener('change', updatePathway));
  updateSelection();
  updatePathway();
  const openLinkedTopic = () => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target instanceof HTMLDetailsElement && target.id.startsWith('faq-')) target.open = true;
  };
  openLinkedTopic();
  window.addEventListener('hashchange', openLinkedTopic);
  // Clicking the current hash does not emit hashchange. Open the requested
  // topic on every ordinary activation, including a repeated keyboard click.
  productPage.querySelectorAll<HTMLAnchorElement>('a[href^="#faq-"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const topic = document.getElementById(anchor.hash.slice(1));
      if (topic instanceof HTMLDetailsElement) topic.open = true;
    });
  });
  // Keep the small-screen inquiry bar out of the way while the form is visible.
  const inquiry = productPage.querySelector('#inquiry');
  const mobileBar = productPage.querySelector<HTMLElement>('.sb-mobile-inquiry');
  if (inquiry && mobileBar && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => { mobileBar.classList.toggle('is-at-inquiry', entries[0].isIntersecting); }, { threshold: 0 }).observe(inquiry);
  }
}
