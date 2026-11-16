const FACTORY_TIME_ZONE = 'Asia/Shanghai';
const MAX_BODY_BYTES = 32 * 1024;
const DELIVERY_URL = 'https://api.resend.com/emails';
const PROJECT_TYPES = {
  'existing-products': 'Existing Product Customization',
  'product-adaptation': 'Product Adaptation',
  'new-product-development': 'New Product Development',
  'oem-manufacturing': 'OEM Manufacturing',
  'not-sure': 'Not sure — help me choose',
};
const NDA_REQUEST_TEXT = 'I need to discuss an NDA before sharing detailed files.';
const PROJECT_FIELDS = {
  email: 254, details: 10000, projectType: 80, name: 200, company: 200,
  quantity: 200, market: 200, timeline: 500, referenceLinks: 4000,
  requirements: 4000, ndaRequest: 200, source: 2000,
  customizationNotes: 4000, adaptationNotes: 4000, developmentNotes: 4000, oemNotes: 4000,
};
const VISIT_FIELDS = {
  name: 200, email: 254, preferredDate: 10, timeZone: 50, company: 200,
  preferredTime: 20, visitors: 16, discussion: 6000, source: 2000,
};
const MULTILINE_FIELDS = new Set(['details', 'referenceLinks', 'requirements', 'customizationNotes', 'adaptationNotes', 'developmentNotes', 'oemNotes', 'discussion']);
const PREFERRED_TIMES = { morning: 'Morning', afternoon: 'Afternoon', 'no-preference': 'No preference' };

function validEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[\u0000-\u001f\u007f]/.test(value);
}

function factoryToday(now) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: FACTORY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function validCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validReferenceLinks(value) {
  return value.split(/\s+/).every((item) => {
    try {
      const url = new URL(item);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
    } catch { return false; }
  });
}

/** Legacy payloads without request_type remain project inquiries. */
export function validateRfqPayload(payload, now = new Date()) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, fields: { form: 'Send a JSON object.' } };
  const requestType = payload.request_type === undefined ? 'project_inquiry' : payload.request_type;
  if (!['project_inquiry', 'factory_visit'].includes(requestType)) return { ok: false, fields: { request_type: 'Choose a supported request type.' } };
  const limits = requestType === 'factory_visit' ? VISIT_FIELDS : PROJECT_FIELDS;
  const fields = {};
  const value = { request_type: requestType };
  for (const [key, raw] of Object.entries(payload)) {
    if (key === 'request_type') continue;
    if (!Object.hasOwn(limits, key)) {
      fields.form = 'This request contains unsupported fields.';
      continue;
    }
    if (typeof raw !== 'string') {
      fields[key] = 'Enter a text value.';
      continue;
    }
    const text = raw.trim();
    if (text.length > limits[key]) fields[key] = `Use no more than ${limits[key]} characters.`;
    else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text) || (!MULTILINE_FIELDS.has(key) && /[\r\n]/.test(text))) fields[key] = 'Remove unsupported control characters.';
    else if (text) value[key] = text;
  }
  if (!validEmail(value.email)) fields.email = 'Enter a valid email address.';
  if (requestType === 'factory_visit') {
    if (!value.name) fields.name = 'Enter your full name.';
    if (!value.preferredDate || !validCalendarDate(value.preferredDate)) fields.preferredDate = 'Choose a valid visit date.';
    else if (value.preferredDate < factoryToday(now)) fields.preferredDate = 'Choose today or a future date in China Standard Time.';
    if (value.timeZone !== FACTORY_TIME_ZONE) fields.timeZone = 'Use the factory time zone, Asia/Shanghai.';
    if (value.preferredTime && !Object.hasOwn(PREFERRED_TIMES, value.preferredTime)) fields.preferredTime = 'Choose Morning, Afternoon or No preference.';
    if (value.visitors && (!/^\d+$/.test(value.visitors) || !Number.isSafeInteger(Number(value.visitors)) || Number(value.visitors) < 1)) fields.visitors = 'Enter a positive whole number.';
  } else {
    if (!value.details) fields.details = 'Describe the product or project you want to discuss.';
    if (!Object.hasOwn(PROJECT_TYPES, value.projectType ?? '')) fields.projectType = 'Choose a supported project type.';
    if (value.referenceLinks && !validReferenceLinks(value.referenceLinks)) fields.referenceLinks = 'Use complete http:// or https:// links, one per line.';
    if (value.ndaRequest && value.ndaRequest !== NDA_REQUEST_TEXT) fields.ndaRequest = 'Use the supported NDA request.';
  }
  return Object.keys(fields).length ? { ok: false, fields } : { ok: true, value };
}

/** Plain text avoids interpreting customer content as HTML or mail headers. */
export function buildRfqMessage(payload) {
  const lines = [`Request type: ${payload.request_type}`];
  const append = (key, label) => { if (payload[key]) lines.push(`${label}: ${payload[key]}`); };
  append('name', 'Full name');
  append('email', 'Email');
  append('company', 'Company');
  if (payload.request_type === 'factory_visit') {
    lines.push(`Preferred visit date: ${payload.preferredDate}`, 'Factory local time: China Standard Time (UTC+8) — Asia/Shanghai');
    if (payload.preferredTime) lines.push(`Preferred time: ${PREFERRED_TIMES[payload.preferredTime]}`);
    append('visitors', 'Number of visitors');
    append('discussion', 'What would you like to discuss?');
    append('source', 'Source context');
    lines.push('', 'This visit request is subject to confirmation. The team must confirm the date and arrangements.');
    return { subject: 'Factory Visit Request — LEANODM', text: lines.join('\n'), reply_to: payload.email };
  }
  lines.push(`Project type: ${PROJECT_TYPES[payload.projectType]} (${payload.projectType})`);
  for (const [key, label] of Object.entries({ details: 'Project description', quantity: 'Quantity', market: 'Market', timeline: 'Timeline', referenceLinks: 'Reference links', requirements: 'Requirements', ndaRequest: 'Confidentiality request', customizationNotes: 'Customization notes', adaptationNotes: 'Adaptation notes', developmentNotes: 'Development notes', oemNotes: 'OEM notes', source: 'Source context' })) append(key, label);
  return { subject: 'Project Inquiry / RFQ — LEANODM', text: lines.join('\n'), reply_to: payload.email };
}

function json(status, body, extraHeaders = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders } });
}

class BodyTooLarge extends Error {}

async function readBoundedText(body, maximum) {
  if (!body) return '';
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new BodyTooLarge(); }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}

function deliveryConfiguration(env) {
  const key = env?.RFQ_DELIVERY_API_KEY;
  const from = env?.RFQ_FROM_EMAIL;
  const to = env?.RFQ_TO_EMAIL;
  return typeof key === 'string' && key.trim() && !/[\r\n]/.test(key) && validEmail(from) && validEmail(to)
    ? { key, from, to } : null;
}

/** Same-origin JSON endpoint. Acceptance means provider acceptance, never delivery or booking confirmation. */
export async function handleRfqRequest(request, env, options = {}) {
  if (request.method !== 'POST') return json(405, { accepted: false, error: 'method_not_allowed' }, { Allow: 'POST' });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json(403, { accepted: false, error: 'origin_not_allowed' });
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, { accepted: false, error: 'json_required' });
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (idempotencyKey !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) return json(400, { accepted: false, error: 'invalid_idempotency_key' });
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)) return json(413, { accepted: false, error: 'request_too_large' });
  let payload;
  try { payload = JSON.parse(await readBoundedText(request.body, MAX_BODY_BYTES)); }
  catch (error) { return json(error instanceof BodyTooLarge ? 413 : 400, { accepted: false, error: error instanceof BodyTooLarge ? 'request_too_large' : 'invalid_json' }); }
  const validation = validateRfqPayload(payload, options.now ?? new Date());
  if (!validation.ok) return json(422, { accepted: false, error: 'validation_failed', fields: validation.fields });
  const config = deliveryConfiguration(env);
  if (!config) return json(503, { accepted: false, error: 'receiver_unavailable' });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.deliveryTimeoutMs ?? 10000);
  try {
    const response = await (options.fetch ?? fetch)(DELIVERY_URL, {
      method: 'POST', headers: {
        Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json',
        ...(idempotencyKey === null ? {} : { 'Idempotency-Key': `${validation.value.request_type}/${idempotencyKey}` }),
      },
      body: JSON.stringify({ from: config.from, to: [config.to], ...buildRfqMessage(validation.value) }),
      signal: controller.signal,
    });
    if (!response.ok) { await response.body?.cancel(); return json(502, { accepted: false, error: 'delivery_unavailable' }); }
    const result = JSON.parse(await readBoundedText(response.body, 8192));
    if (!result || typeof result.id !== 'string' || !result.id.trim() || result.id.length > 200 || result.error) return json(502, { accepted: false, error: 'delivery_unavailable' });
    return json(202, { accepted: true });
  } catch { return json(502, { accepted: false, error: 'delivery_unavailable' }); }
  finally { clearTimeout(timer); }
}
