import {
  copyBrief,
  emailBriefUrl,
  formatBrief,
  readDraft,
  readQueryDraft,
  resolveEndpoint,
  sendInquiry,
  validateDraft,
  type InquiryDraft,
} from '../utils/rfq';
import { inquiryHandoffToken, mergeInquiryDraft, readInquiryHandoff } from '../utils/inquiry-handoff';

function initializeInquiry(form: HTMLFormElement) {
  if (form.dataset.rfqInitialized) return;
  const submit = form.querySelector<HTMLButtonElement>('[data-rfq-submit]');
  const status = form.querySelector<HTMLElement>('[data-rfq-status]');
  if (!submit || !status) return;
  form.dataset.rfqInitialized = 'true';
  form.noValidate = true;

  const fields = form.querySelector<HTMLFieldSetElement>('[data-rfq-fields]');
  const copyButton = form.querySelector<HTMLButtonElement>('[data-copy-brief]');
  const emailLink = form.querySelector<HTMLAnchorElement>('[data-email-brief]');
  const fallback = form.querySelector<HTMLElement>('[data-brief-fallback]');
  const briefText = form.querySelector<HTMLTextAreaElement>('[data-brief-text]');
  const context = form.querySelector<HTMLElement>('[data-rfq-context]');
  const submitLabel = submit.querySelector<HTMLElement>('[data-rfq-submit-label]') ?? submit;
  let busy = false;
  let endpoint: string | null = null;
  let draftVersion = 0;
  let acceptedSignature: string | null = null;

  function setSubmitLabel(text: string) {
    submitLabel.textContent = text;
  }

  function clearFeedback() {
    if (status!.dataset.state !== 'pending') {
      status!.hidden = true;
      status!.textContent = '';
      delete status!.dataset.state;
    }
    if (fallback) fallback.hidden = true;
    if (briefText) briefText.value = '';
  }

  function showStatus(state: 'pending' | 'error' | 'accepted' | 'copied', message: string, focus = true) {
    status!.hidden = false;
    status!.dataset.state = state;
    status!.setAttribute('role', state === 'error' ? 'alert' : 'status');
    status!.textContent = message;
    if (focus) status!.focus();
  }

  try {
    endpoint = resolveEndpoint(form.dataset.endpoint ?? '', window.location.origin);
  } catch {
    showStatus('error', 'Online sending is unavailable. You can copy your inquiry brief or use email.', false);
  }

  function draft() {
    return readDraft(new FormData(form));
  }

  function signature(inquiry = draft()) {
    return JSON.stringify(inquiry);
  }

  // An explicit same-tab handoff may contain contact details. Its opaque token
  // is the only handoff value in the URL; existing browser-restored input wins.
  try {
    const token = inquiryHandoffToken(new URLSearchParams(window.location.search), window.history.state);
    const saved = readInquiryHandoff(window.sessionStorage, token);
    if (saved) {
      const merged = mergeInquiryDraft(draft(), saved.draft);
      for (const [name, value] of Object.entries(merged)) {
        const control = form.elements.namedItem(name);
        if (control instanceof RadioNodeList) control.value = value;
        else if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.value = value;
      }
    }
  } catch {
    // Disabled storage leaves the existing query and email alternatives intact.
  }

  const inherited = readQueryDraft(new URLSearchParams(window.location.search), draft());
  for (const [name, value] of Object.entries(inherited)) {
    const control = form.elements.namedItem(name);
    if (control instanceof RadioNodeList) control.value = value;
    else if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.value = value;
  }

  function synchronizePanels() {
    const type = draft().projectType;
    form.querySelectorAll<HTMLFieldSetElement>('[data-project-panel]').forEach(panel => {
      const active = panel.dataset.projectPanel === type;
      panel.hidden = !active;
      panel.disabled = !active;
    });
  }

  function updateEmailDraft() {
    if (emailLink) emailLink.href = emailBriefUrl(draft());
    if (context) {
      const source = draft().source;
      context.hidden = !source;
      context.textContent = source ? `Project context: ${source}` : '';
    }
  }

  function clearError(name: string) {
    const control = form.elements.namedItem(name);
    const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (error) error.hidden = true;
    if (control instanceof HTMLElement) {
      control.removeAttribute('aria-invalid');
      const descriptions = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== error?.id);
      if (descriptions.length) control.setAttribute('aria-describedby', descriptions.join(' '));
      else control.removeAttribute('aria-describedby');
    }
  }

  function validatedDraft(): InquiryDraft | null {
    for (const name of ['email', 'details', 'referenceLinks']) clearError(name);
    const inquiry = draft();
    const errors = validateDraft(inquiry);
    const names = Object.keys(errors);
    if (!names.length) return inquiry;
    for (const name of names) {
      const control = form.elements.namedItem(name);
      const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      if (error) {
        if (!error.id) error.id = `rfq-${name}-error`;
        error.textContent = errors[name as keyof typeof errors] ?? '';
        error.hidden = false;
      }
      if (control instanceof HTMLElement) {
        control.setAttribute('aria-invalid', 'true');
        if (error) {
          const descriptions = new Set((control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
          descriptions.add(error.id);
          control.setAttribute('aria-describedby', [...descriptions].join(' '));
        }
      }
    }
    showStatus('error', 'Please check the highlighted fields. Your inquiry has not been sent.', false);
    const first = form.elements.namedItem(names[0]);
    if (first instanceof HTMLElement) {
      let ancestor: HTMLElement | null = first.parentElement;
      while (ancestor) {
        if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
      first.focus();
    }
    return null;
  }

  function buttonsDisabled(disabled: boolean) {
    submit!.disabled = disabled || Boolean(endpoint && acceptedSignature === signature());
    if (copyButton) copyButton.disabled = disabled;
  }

  async function copyInquiry(inquiry: InquiryDraft) {
    const copiedVersion = draftVersion;
    busy = true;
    buttonsDisabled(true);
    try {
      const writeText = navigator.clipboard?.writeText.bind(navigator.clipboard);
      const result = await copyBrief(formatBrief(inquiry), writeText);
      if (copiedVersion !== draftVersion) return;
      if (fallback) fallback.hidden = result.copied;
      if (briefText) briefText.value = result.text;
      if (result.copied) {
        showStatus('copied', 'Inquiry brief copied. It has not been sent. Paste it into an email to quotes@leanodm.com.');
      } else {
        showStatus('error', 'Your browser could not copy the brief. Select and copy the text below, then email it to quotes@leanodm.com. It has not been sent.', !briefText);
        if (briefText) {
          briefText.focus();
          briefText.select();
        }
      }
    } finally {
      busy = false;
      buttonsDisabled(false);
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const inquiry = validatedDraft();
    if (!inquiry) return;
    if (endpoint && acceptedSignature === signature(inquiry)) return;
    if (!endpoint) {
      await copyInquiry(inquiry);
      return;
    }

    busy = true;
    const submittedVersion = draftVersion;
    buttonsDisabled(true);
    if (fields) fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setSubmitLabel('Sending…');
    showStatus('pending', 'Sending your inquiry. Please wait for confirmation.');
    try {
      await sendInquiry(endpoint, inquiry);
      acceptedSignature = signature(inquiry);
      if (submittedVersion === draftVersion) {
        showStatus('accepted', 'The inquiry service accepted your request. This confirms acceptance, not email delivery. Your details remain here for your records.');
      } else {
        status!.hidden = true;
        delete status!.dataset.state;
      }
    } catch {
      showStatus('error', 'We could not confirm acceptance of your inquiry. Your details are still here. Copy the brief or email quotes@leanodm.com instead.');
    } finally {
      busy = false;
      if (fields) fields.disabled = false;
      form.removeAttribute('aria-busy');
      buttonsDisabled(false);
      setSubmitLabel('Send inquiry');
    }
  });

  copyButton?.addEventListener('click', async () => {
    if (busy) return;
    const inquiry = validatedDraft();
    if (inquiry) await copyInquiry(inquiry);
  });

  let observedSignature = '';
  function editDraft(event: Event) {
    const control = event.target;
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
      if (['email', 'details', 'referenceLinks'].includes(control.name)) clearError(control.name);
      if (control.name === 'projectType') synchronizePanels();
      if (control.name && observedSignature !== signature()) {
        observedSignature = signature();
        draftVersion++;
        clearFeedback();
      }
    }
    updateEmailDraft();
    if (!busy) buttonsDisabled(false);
  }
  form.addEventListener('input', editDraft);
  form.addEventListener('change', editDraft);

  synchronizePanels();
  updateEmailDraft();
  observedSignature = signature();
  setSubmitLabel(endpoint ? 'Send inquiry' : 'Copy inquiry brief');
  if (copyButton) copyButton.hidden = !endpoint;
  buttonsDisabled(false);
}

function initializeForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-rfq-form]').forEach(initializeInquiry);
}

initializeForms();
document.addEventListener('astro:page-load', initializeForms);
