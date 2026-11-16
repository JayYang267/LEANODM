import { factoryToday, readVisit, validateVisit, formatVisit, emailVisitUrl, sendVisit } from '../utils/factory-visit';
import { copyBrief, resolveEndpoint } from '../utils/rfq';

function initializeVisit(form: HTMLFormElement) {
  if (form.dataset.initialized) return;
  const submit = form.querySelector<HTMLButtonElement>('[data-visit-submit]');
  const status = form.querySelector<HTMLElement>('[data-visit-status]');
  const fields = form.querySelector<HTMLFieldSetElement>('[data-visit-fields]');
  const copy = form.querySelector<HTMLButtonElement>('[data-visit-copy]');
  const email = form.querySelector<HTMLAnchorElement>('[data-visit-email]');
  const fallback = form.querySelector<HTMLElement>('[data-visit-fallback]');
  const text = form.querySelector<HTMLTextAreaElement>('[data-visit-text]');
  const date = form.querySelector<HTMLInputElement>('[name="preferredDate"]');
  if (!submit || !status || !fields) return;
  form.dataset.initialized = 'true';
  form.noValidate = true;
  let endpoint: string | null = null;
  let busy = false;
  let accepted = '';
  const draft = () => readVisit(new FormData(form));
  const signature = () => JSON.stringify(draft());
  let observedSignature = signature();
  let submissionKey = crypto.randomUUID();
  const refreshDate = () => { if (date) date.min = factoryToday(); };
  const message = (state: string, content: string, focus = true) => {
    status.hidden = false;
    status.dataset.state = state;
    status.setAttribute('role', state === 'error' ? 'alert' : 'status');
    status.textContent = content;
    if (focus) status.focus();
  };
  try { endpoint = resolveEndpoint(form.dataset.endpoint ?? '', window.location.origin); }
  catch { message('error', 'Online sending is unavailable. Copy your visit request or open an email draft.', false); }
  const idleLabel = () => endpoint ? 'Request a Factory Visit' : 'Copy visit request';
  function ready() {
    submit!.disabled = busy || Boolean(endpoint && accepted === signature());
    if (copy) copy.disabled = busy;
    if (email) {
      email.setAttribute('aria-disabled', String(busy));
      email.tabIndex = busy ? -1 : 0;
    }
  }
  function clearErrors() {
    form.querySelectorAll<HTMLElement>('[data-visit-error]').forEach(el => { el.hidden = true; el.textContent = ''; });
    form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }
  function validate() {
    refreshDate();
    clearErrors();
    const values = draft();
    const errors = validateVisit(values);
    for (const [name, content] of Object.entries(errors)) {
      const field = form.elements.namedItem(name);
      const error = form.querySelector<HTMLElement>(`[data-visit-error="${name}"]`);
      if (error) { error.textContent = content; error.hidden = false; }
      if (field instanceof HTMLElement) {
        field.setAttribute('aria-invalid', 'true');
        const details = field.closest('details');
        if (details) details.open = true;
      }
    }
    const first = Object.keys(errors)[0];
    if (first) {
      message('error', 'Please check the highlighted visit fields. Your request has not been sent.', false);
      const field = form.elements.namedItem(first);
      if (field instanceof HTMLElement) field.focus();
      return null;
    }
    return values;
  }
  async function copyRequest(values: ReturnType<typeof readVisit>) {
    const original = signature();
    busy = true; ready();
    try {
      const result = await copyBrief(formatVisit(values), navigator.clipboard?.writeText.bind(navigator.clipboard));
      if (original !== signature()) return;
      if (text) text.value = result.text;
      if (fallback) fallback.hidden = result.copied;
      if (result.copied) message('copied', 'Visit request copied. It has not been sent. Paste it into an email to projects@leanodm.com and send it.');
      else {
        message('error', 'Your browser could not copy the request. Select the text below and email it to projects@leanodm.com. It has not been sent.', false);
        text?.focus(); text?.select();
      }
    } finally { busy = false; ready(); }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const values = validate();
    if (!values || (endpoint && accepted === signature())) return;
    if (!endpoint) { await copyRequest(values); return; }
    const submitted = signature();
    busy = true; ready(); fields.disabled = true;
    form.setAttribute('aria-busy', 'true'); submit.textContent = 'Sending visit request…';
    message('pending', 'Sending your visit request. Please wait for the receiving service.');
    try {
      await sendVisit(endpoint, values, { idempotencyKey: submissionKey });
      accepted = submitted;
      message('accepted', 'Your visit request has been received. Our team will contact you to confirm the date and arrangements.');
    } catch {
      message('error', 'We could not confirm receipt of your visit request. Your entries are still here. Retry, copy the request or open an email draft.');
    } finally {
      fields.disabled = false; busy = false;
      form.removeAttribute('aria-busy'); submit.textContent = idleLabel(); ready();
    }
  });
  copy?.addEventListener('click', async () => { if (!busy) { const values = validate(); if (values) await copyRequest(values); } });
  email?.addEventListener('click', event => {
    if (busy || !validate()) { event.preventDefault(); return; }
    email.href = emailVisitUrl(draft());
    message('copied', 'Email draft prepared. Your visit request has not been sent. Complete sending in your email app.');
  });
  function edit() {
    if (busy) return;
    if (observedSignature !== signature()) {
      observedSignature = signature();
      submissionKey = crypto.randomUUID();
    }
    if (accepted !== signature()) accepted = '';
    status!.hidden = true; clearErrors();
    if (fallback) fallback.hidden = true;
    if (email) email.href = emailVisitUrl(draft());
    ready();
  }
  form.addEventListener('input', edit);
  form.addEventListener('change', edit);
  form.addEventListener('focusin', refreshDate);
  form.addEventListener('reset', event => {
    if (busy) { event.preventDefault(); return; }
    queueMicrotask(() => { accepted = ''; edit(); });
  });
  refreshDate();
  if (email) email.href = emailVisitUrl(draft());
  if (copy) copy.hidden = !endpoint;
  submit.textContent = idleLabel(); ready();
}
function initialize() { document.querySelectorAll<HTMLFormElement>('[data-visit-form]').forEach(initializeVisit); }
initialize();
document.addEventListener('astro:page-load', initialize);
