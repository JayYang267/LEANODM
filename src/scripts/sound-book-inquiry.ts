import { PROJECT_TYPES, copyBrief, emailBriefUrl, formatBrief, readDraft, validateDraft, type InquiryDraft, type ProjectType } from '../utils/rfq';
import { INQUIRY_HANDOFF_PARAM, inquiryHandoffToken, mergeInquiryDraft, partitionCustomizationChoices, readInquiryHandoff, saveInquiryHandoff, type InquirySelection } from '../utils/inquiry-handoff';

type ProductReference = { id: string; name: string; path: string; shownLanguages: readonly string[] };

function initializeSoundBookInquiry(form: HTMLFormElement) {
  if (form.dataset.inquiryInitialized) return;
  const prepareButton = form.querySelector<HTMLButtonElement>('[data-inquiry-prepare]');
  const copyButton = form.querySelector<HTMLButtonElement>('[data-inquiry-copy]');
  const status = form.querySelector<HTMLElement>('[data-inquiry-status]');
  const preview = form.querySelector<HTMLElement>('[data-inquiry-preview]');
  const brief = form.querySelector<HTMLTextAreaElement>('[data-inquiry-brief]');
  const emailLink = form.querySelector<HTMLAnchorElement>('[data-inquiry-email]');
  const selectionSummary = form.querySelector<HTMLElement>('[data-inquiry-selection]');
  const carriedPanel = form.querySelector<HTMLElement>('[data-inquiry-carried]');
  const carriedList = form.querySelector<HTMLUListElement>('[data-inquiry-carried-list]');
  const productControl = form.elements.namedItem('productId');
  const routeControl = form.elements.namedItem('projectType');
  const otherLanguage = form.elements.namedItem('otherLanguage');
  const otherLanguagePanel = form.querySelector<HTMLElement>('[data-inquiry-other-language]');
  if (!prepareButton || !copyButton || !status || !preview || !brief || !emailLink || !(productControl instanceof HTMLSelectElement) || !(routeControl instanceof HTMLSelectElement)) return;
  form.dataset.inquiryInitialized = 'true';
  form.noValidate = true;
  const productName = form.dataset.productName || 'Sound Book';
  const sourceUrl = new URL(form.dataset.productPath || window.location.pathname, window.location.origin).href;
  let products: ProductReference[] = [];
  try {
    const data: unknown = JSON.parse(document.querySelector('[data-inquiry-products]')?.textContent || '[]');
    if (Array.isArray(data)) products = data.filter((item): item is ProductReference => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.path === 'string' && item.path.startsWith('/') && !item.path.startsWith('//') && new URL(item.path, window.location.origin).origin === window.location.origin));
  } catch { /* An invalid catalog leaves the style undecided. */ }
  let carriedCustomizations: string[] = [];
  let renderedCarried = '';
  const changedFields = new Set<string>();
  let version = 0;
  let copying = false;

  function selection(): InquirySelection {
    const customizationControls = [...document.querySelectorAll<HTMLInputElement>('input[name="customization"]')];
    const checked = customizationControls.filter(input => input.checked).map(input => input.value.trim()).filter(Boolean);
    const customizations = [...new Set([...checked, ...carriedCustomizations])];
    const selectedProduct = products.find(product => product.id === productControl.value);
    return {
      ...(selectedProduct ? { productId: selectedProduct.id } : {}),
      languages: [...form.querySelectorAll<HTMLInputElement>('input[name="languages"]:checked')].map(input => input.value),
      otherLanguage: otherLanguage instanceof HTMLInputElement ? otherLanguage.value.trim() : '',
      customizations,
      projectType: Object.hasOwn(PROJECT_TYPES, routeControl.value) ? routeControl.value as ProjectType : 'not-sure',
    };
  }

  function selectionText(chosen = selection()) {
    const selectedProduct = products.find(product => product.id === chosen.productId);
    const languageNames = chosen.languages?.map(language => language === 'Other' && chosen.otherLanguage ? `Other: ${chosen.otherLanguage}` : language) || [];
    return {
      selectedProduct,
      style: selectedProduct ? `${selectedProduct.id} — ${selectedProduct.name}` : 'Not decided',
      languages: languageNames.length ? languageNames.join(', ') : 'Not decided',
      customizations: chosen.customizations?.length ? chosen.customizations.join(', ') : 'Not decided',
      route: chosen.projectType && chosen.projectType !== 'not-sure' ? PROJECT_TYPES[chosen.projectType] : 'Not decided — help me choose',
    };
  }

  function draft(): InquiryDraft {
    const chosen = selection();
    const text = selectionText(chosen);
    const data = new FormData(form);
    data.set('projectType', chosen.projectType || 'not-sure');
    data.set('source', `${productName}; ${sourceUrl}`);
    data.set('requirements', [
      `Reference style: ${text.style}`,
      `Reference product page: ${text.selectedProduct ? new URL(text.selectedProduct.path, window.location.origin).href : 'Not selected'}`,
      `Inquiry source page: ${sourceUrl}`,
      `Language requirements: ${text.languages}`,
      `Customization options: ${text.customizations}`,
      `Project route: ${text.route}`,
    ].join('\n'));
    return readDraft(data);
  }

  function showStatus(message: string, error = false, focus = true) {
    status.hidden = false;
    status.textContent = message;
    status.setAttribute('role', error ? 'alert' : 'status');
    status.dataset.state = error ? 'error' : 'prepared';
    if (focus) status.focus();
  }

  function showPreview(inquiry: InquiryDraft) {
    brief.value = formatBrief(inquiry);
    emailLink.href = emailBriefUrl(inquiry);
    preview.hidden = false;
  }

  function refresh() {
    const text = selectionText();
    if (selectionSummary) selectionSummary.textContent = `Reference style: ${text.style}. Languages: ${text.languages}. Customization: ${text.customizations}. Project route: ${text.route}.`;
    const hasOther = selection().languages?.includes('Other') || false;
    if (otherLanguagePanel) otherLanguagePanel.hidden = !hasOther;
    if (otherLanguage instanceof HTMLInputElement) otherLanguage.disabled = !hasOther;
    renderCarriedCustomizations();
    if (!preview.hidden) showPreview(draft());
  }

  function renderCarriedCustomizations() {
    if (!carriedPanel || !carriedList) return;
    carriedPanel.hidden = carriedCustomizations.length === 0;
    const signature = JSON.stringify(carriedCustomizations);
    if (signature === renderedCarried) return;
    renderedCarried = signature;
    carriedList.replaceChildren(...carriedCustomizations.map(value => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = value;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'sb-inquiry-carried-remove';
      remove.dataset.inquiryCarriedRemove = value;
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove carried customization: ${value}`);
      remove.addEventListener('click', () => {
        const index = carriedCustomizations.indexOf(value);
        carriedCustomizations = carriedCustomizations.filter(choice => choice !== value);
        changedFields.add('customization');
        version++;
        refresh();
        showStatus(`Removed “${value}” from the carried choices. Your other choices remain in the brief. Nothing has been sent.`, false, false);
        const buttons = [...carriedList.querySelectorAll<HTMLButtonElement>('button')];
        const next = buttons[Math.min(index, buttons.length - 1)];
        if (next) next.focus();
        else if (selectionSummary) { selectionSummary.tabIndex = -1; selectionSummary.focus(); }
      });
      item.append(label, remove);
      return item;
    }));
  }

  function synchronizeParentRoute() {
    const radios = [...document.querySelectorAll<HTMLInputElement>('input[name="pathway"]')];
    let changed: HTMLInputElement | undefined;
    for (const radio of radios) {
      const checked = radio.value === routeControl.value;
      if (radio.checked !== checked) { radio.checked = checked; changed = radio; }
    }
    changed?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function applySelection(chosen: InquirySelection, onlyEmpty = false) {
    if (!onlyEmpty) for (const name of ['productId', 'languages', 'otherLanguage', 'customizations', 'projectType'] as const) if (chosen[name] !== undefined) changedFields.add(name === 'customizations' ? 'customization' : name);
    if (chosen.productId !== undefined && (!onlyEmpty || (!changedFields.has('productId') && !productControl.value))) productControl.value = products.some(product => product.id === chosen.productId) ? chosen.productId : '';
    if (Array.isArray(chosen.languages) && (!onlyEmpty || (!changedFields.has('languages') && !form.querySelector('input[name="languages"]:checked')))) {
      form.querySelectorAll<HTMLInputElement>('input[name="languages"]').forEach(input => { input.checked = chosen.languages!.includes(input.value); });
    }
    if (typeof chosen.otherLanguage === 'string' && otherLanguage instanceof HTMLInputElement && (!onlyEmpty || (!changedFields.has('otherLanguage') && !otherLanguage.value.trim()))) otherLanguage.value = chosen.otherLanguage.slice(0, 120);
    if (Array.isArray(chosen.customizations)) {
      const controls = [...document.querySelectorAll<HTMLInputElement>('input[name="customization"]')];
      if (!onlyEmpty || !changedFields.has('customization')) {
        const choices = partitionCustomizationChoices(chosen.customizations, controls.map(input => input.value));
        carriedCustomizations = onlyEmpty ? [...new Set([...carriedCustomizations, ...choices.carried])] : choices.carried;
        controls.forEach(input => {
          const checked = choices.checked.includes(input.value) || (onlyEmpty && input.checked);
          if (input.checked !== checked) { input.checked = checked; input.dispatchEvent(new Event('change', { bubbles: true })); }
        });
      }
    }
    if (chosen.projectType !== undefined && (!onlyEmpty || (!changedFields.has('projectType') && routeControl.value === 'not-sure'))) routeControl.value = Object.hasOwn(PROJECT_TYPES, chosen.projectType) ? chosen.projectType : 'not-sure';
    synchronizeParentRoute();
    refresh();
  }

  function restoreHandoff() {
    try {
      const token = inquiryHandoffToken(new URLSearchParams(window.location.search), window.history.state);
      const saved = readInquiryHandoff(window.sessionStorage, token);
      if (!saved) return;
      const current = readDraft(new FormData(form));
      if (!current.email && !current.details && current.quantity === 'Not decided') current.quantity = '';
      const merged = mergeInquiryDraft(current, saved.draft);
      for (const [name, value] of Object.entries(merged)) {
        if (changedFields.has(name)) continue;
        const control = form.elements.namedItem(name);
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.value = value;
      }
      applySelection({ ...saved.selection, projectType: merged.projectType }, true);
    } catch { /* Reading disabled storage must not stop the email alternatives. */ }
  }

  function clearError(name: string) {
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLElement) control.removeAttribute('aria-invalid');
    const error = form.querySelector<HTMLElement>(`[data-inquiry-error="${name}"]`);
    if (error) { error.hidden = true; error.textContent = ''; }
  }

  function validatedDraft(): InquiryDraft | null {
    for (const name of ['email', 'market', 'details', 'referenceLinks']) clearError(name);
    const inquiry = draft();
    const errors: Record<string, string | undefined> = { ...validateDraft(inquiry) };
    if (!inquiry.market?.trim()) errors.market = 'Enter a target market, or write “Not decided.”';
    const names = Object.keys(errors);
    if (!names.length) return inquiry;
    for (const name of names) {
      const control = form.elements.namedItem(name);
      const error = form.querySelector<HTMLElement>(`[data-inquiry-error="${name}"]`);
      if (control instanceof HTMLElement) control.setAttribute('aria-invalid', 'true');
      if (error) { error.textContent = errors[name] || ''; error.hidden = false; }
    }
    showStatus('Check the highlighted fields. Nothing has been sent.', true, false);
    const first = form.elements.namedItem(names[0]);
    if (first instanceof HTMLElement) first.focus();
    return null;
  }

  function edit(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) || input === brief) return;
    if (!form.contains(input) && !['customization', 'pathway'].includes(input.name)) return;
    if (event.isTrusted) changedFields.add(input.name === 'pathway' ? 'projectType' : input.name);
    if (form.contains(input)) clearError(input.name);
    if (input.name === 'pathway' && input instanceof HTMLInputElement && input.checked) routeControl.value = Object.hasOwn(PROJECT_TYPES, input.value) ? input.value : 'not-sure';
    if (input === routeControl) synchronizeParentRoute();
    version++;
    status.hidden = true;
    refresh();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const inquiry = validatedDraft();
    if (!inquiry) return;
    showPreview(inquiry);
    showStatus('Your email draft is ready to review below. Open it in your mail app to send it; nothing has been sent.');
  });
  copyButton.addEventListener('click', async () => {
    if (copying) return;
    const inquiry = validatedDraft();
    if (!inquiry) return;
    showPreview(inquiry);
    const copiedVersion = version;
    copying = true;
    copyButton.disabled = true;
    try {
      const result = await copyBrief(formatBrief(inquiry), navigator.clipboard?.writeText.bind(navigator.clipboard));
      if (copiedVersion !== version) return;
      if (result.copied) showStatus('Inquiry brief copied. Paste it into an email to quotes@leanodm.com. Nothing has been sent.');
      else { showStatus('Automatic copying is unavailable. Select and copy the brief below, then email quotes@leanodm.com. Nothing has been sent.', true, false); brief.focus(); brief.select(); }
    } finally { copying = false; copyButton.disabled = false; }
  });

  document.addEventListener('input', edit);
  document.addEventListener('change', edit);
  document.addEventListener('soundbook:inquiry-selection', event => {
    if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== 'object') return;
    version++;
    status.hidden = true;
    applySelection(event.detail as InquirySelection);
  });
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
    const inquiryChoice = event.target.closest<HTMLElement>('[data-product-inquiry]');
    if (inquiryChoice && products.some(product => product.id === inquiryChoice.dataset.productInquiry)) {
      event.preventDefault();
      version++;
      applySelection({ productId: inquiryChoice.dataset.productInquiry });
      document.getElementById('inquiry')?.scrollIntoView({ block: 'start' });
      return;
    }
    const anchor = event.target.closest<HTMLAnchorElement>('a[data-inquiry-full-rfq], a[data-inquiry-navigation]');
    if (!anchor) return;
    const target = new URL(anchor.href, window.location.origin);
    if (target.origin !== window.location.origin) return;
    event.preventDefault();
    try {
      const token = saveInquiryHandoff(window.sessionStorage, draft(), selection());
      const state = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      window.history.replaceState({ ...state, [INQUIRY_HANDOFF_PARAM]: token }, '', window.location.href);
      target.searchParams.set(INQUIRY_HANDOFF_PARAM, token);
      window.location.assign(target.href);
    } catch {
      showPreview(draft());
      showStatus('Your browser could not keep this brief for the next page. Your inputs remain here. Copy the brief below or open the email draft before continuing. Nothing has been sent.', true, false);
      brief.focus();
      brief.select();
    }
  });

  restoreHandoff();
  synchronizeParentRoute();
  refresh();
  window.addEventListener('pageshow', () => { restoreHandoff(); refresh(); });
  prepareButton.disabled = false;
  copyButton.disabled = false;
}

function initializeSoundBookInquiries() {
  document.querySelectorAll<HTMLFormElement>('form[data-sound-book-inquiry]').forEach(initializeSoundBookInquiry);
}
initializeSoundBookInquiries();
document.addEventListener('astro:page-load', initializeSoundBookInquiries);
