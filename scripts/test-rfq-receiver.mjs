import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import { handleRfqRequest, validateRfqPayload, buildRfqMessage } from '../src/server/rfq-receiver.mjs';

const NOW = new Date('2026-11-10T16:30:00Z'); // November 11 in the factory's time zone.
const ORIGIN = 'https://www.leanodm.com';
const project = { email: 'buyer@example.test', details: 'Please discuss a product.', projectType: 'not-sure' };
const visit = { request_type: 'factory_visit', name: 'Visitor', email: 'visitor@example.test', preferredDate: '2026-11-11', timeZone: 'Asia/Shanghai' };
const env = { RFQ_DELIVERY_API_KEY: 'test-key', RFQ_FROM_EMAIL: 'website@example.test', RFQ_TO_EMAIL: 'team@example.test' };
const options = { now: NOW };
const request = (body, headers = {}) => new Request(`${ORIGIN}/api/rfq`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }, body: JSON.stringify(body),
});
const acceptedProvider = async () => Response.json({ id: 'test-provider-id' });
const errorCode = async (response) => (await response.json()).error;

test('legacy project payload and explicit project_inquiry share the original contract', () => {
  const legacy = validateRfqPayload(project, NOW);
  const explicit = validateRfqPayload({ ...project, request_type: 'project_inquiry' }, NOW);
  assert.equal(legacy.ok, true);
  assert.deepEqual(legacy, explicit);
  assert.equal(legacy.value.request_type, 'project_inquiry');
});

test('project optional fields survive validation and appear as plain text in the message', () => {
  const payload = { ...project, projectType: 'existing-products', name: 'Buyer', company: 'Company', quantity: '500', market: 'EU', timeline: 'Discuss timing', referenceLinks: 'https://example.test/file', requirements: 'Safety requirements', ndaRequest: 'I need to discuss an NDA before sharing detailed files.', customizationNotes: '<sample>', source: '/products/?utm_source=test' };
  const result = validateRfqPayload(payload, NOW);
  assert.equal(result.ok, true);
  const message = buildRfqMessage(result.value);
  assert.equal(message.subject, 'Project Inquiry / RFQ — LEANODM');
  for (const value of Object.values(payload)) assert.ok(message.text.includes(value), value);
  assert.equal(message.reply_to, payload.email);
  assert.equal(message.html, undefined);
});

test('factory request needs only name, email and preferred date with the fixed time zone', () => {
  const result = validateRfqPayload(visit, NOW);
  assert.equal(result.ok, true);
  const message = buildRfqMessage(result.value);
  assert.equal(message.subject, 'Factory Visit Request — LEANODM');
  assert.match(message.text, /Preferred visit date: 2026-11-11/);
  assert.match(message.text, /Asia\/Shanghai/);
  assert.match(message.text, /UTC\+8/);
  assert.match(message.text, /subject to confirmation/i);
  assert.doesNotMatch(message.text, /booking confirmed/i);
});

test('factory optional values are included only when supplied', () => {
  const result = validateRfqPayload({ ...visit, company: 'Buyer company', preferredTime: 'afternoon', visitors: '2', discussion: 'Discuss samples', source: '/rfq/?utm_source=test' }, NOW);
  assert.equal(result.ok, true);
  const message = buildRfqMessage(result.value);
  for (const text of ['Buyer company', 'Afternoon', 'Number of visitors: 2', 'Discuss samples', '/rfq/?utm_source=test']) assert.ok(message.text.includes(text));
  assert.doesNotMatch(buildRfqMessage(validateRfqPayload(visit, NOW).value).text, /Number of visitors:/);
});

test('factory date uses Asia/Shanghai across the UTC date boundary', () => {
  assert.equal(validateRfqPayload({ ...visit, preferredDate: '2026-11-10' }, NOW).ok, false);
  assert.equal(validateRfqPayload(visit, NOW).ok, true);
  assert.equal(validateRfqPayload({ ...visit, preferredDate: '2026-11-12' }, NOW).ok, true);
});

for (const preferredDate of ['2026-02-30', '2026-13-01', '11/11/2026', '2026-11-11T08:00:00Z']) {
  test(`factory rejects invalid calendar date ${preferredDate}`, () => {
    assert.equal(validateRfqPayload({ ...visit, preferredDate }, NOW).ok, false);
  });
}

for (const visitors of ['0', '-1', '1.5', 'two', '9007199254740992']) {
  test(`factory rejects nonpositive or invalid visitor count ${visitors}`, () => {
    assert.equal(validateRfqPayload({ ...visit, visitors }, NOW).ok, false);
  });
}

test('per-type validation rejects unknown fields, wrong types and incomplete required fields', () => {
  for (const payload of [null, [], { ...visit, details: 'RFQ fields do not belong here' }, { ...project, preferredDate: visit.preferredDate }, { ...visit, request_type: 'booking' }, { ...visit, name: '' }, { ...visit, email: 'invalid' }, { ...visit, timeZone: 'America/New_York' }, { ...visit, preferredTime: 'evening' }, { ...visit, company: {} }, { ...project, details: '' }, { ...project, projectType: 'unknown' }, { ...project, email: 'buyer@example.test\r\nBcc: other@example.test' }, { ...project, referenceLinks: 'javascript:alert(1)' }, { ...project, __proto__: null, unexpected: 'value' }]) {
    assert.equal(validateRfqPayload(payload, NOW).ok, false, JSON.stringify(payload));
  }
});

test('provider acceptance is the only successful HTTP result and its payload identifies request type', async () => {
  const sent = [];
  const response = await handleRfqRequest(request(visit), env, { ...options, fetch: async (url, init) => {
    sent.push({ url, init, body: JSON.parse(init.body) });
    return Response.json({ id: 'test-provider-id' });
  } });
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { accepted: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(sent[0].init.headers.Authorization, 'Bearer test-key');
  assert.deepEqual(sent[0].body.to, ['team@example.test']);
  assert.equal(sent[0].body.reply_to, visit.email);
  assert.equal(sent[0].body.subject, 'Factory Visit Request — LEANODM');
  assert.match(sent[0].body.text, /Request type: factory_visit/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('legacy project request is accepted using the same receiver', async () => {
  const response = await handleRfqRequest(request(project), env, { ...options, fetch: async (_url, init) => {
    assert.equal(new Headers(init.headers).has('Idempotency-Key'), false);
    return acceptedProvider();
  } });
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { accepted: true });
});

test('a lost provider response can be retried with the same per-type idempotency key', async () => {
  const uuid = '1939b962-87ba-49bd-ad7c-b3852b1ec769';
  const keys = [];
  const sent = new Map();
  let attempts = 0;
  let deliveries = 0;
  const provider = async (_url, init) => {
    const key = new Headers(init.headers).get('Idempotency-Key');
    keys.push(key);
    attempts++;
    if (!key || !sent.has(key)) {
      deliveries++;
      if (key) sent.set(key, { id: 'accepted-before-response-was-lost' });
    }
    if (attempts === 1) throw new Error('Provider accepted, response lost');
    return Response.json(sent.get(key) ?? { id: 'duplicate-notification' });
  };
  const headers = { 'Idempotency-Key': uuid };
  const first = await handleRfqRequest(request(visit, headers), env, { ...options, fetch: provider });
  const retry = await handleRfqRequest(request(visit, headers), env, { ...options, fetch: provider });
  assert.equal(first.status, 502);
  assert.equal(retry.status, 202);
  assert.deepEqual(keys, [`factory_visit/${uuid}`, `factory_visit/${uuid}`]);
  assert.equal(deliveries, 1);
});

test('the same UUID separates factory visits from project inquiries at the provider', async () => {
  const uuid = 'f8d751e5-9e53-4ec2-aa39-1768d73e8c06';
  const keys = [];
  for (const payload of [visit, project]) {
    const response = await handleRfqRequest(request(payload, { 'Idempotency-Key': uuid }), env, { ...options, fetch: async (_url, init) => {
      keys.push(new Headers(init.headers).get('Idempotency-Key'));
      return acceptedProvider();
    } });
    assert.equal(response.status, 202);
  }
  assert.deepEqual(keys, [`factory_visit/${uuid}`, `project_inquiry/${uuid}`]);
});

test('malformed optional idempotency headers are rejected before calling the provider', async () => {
  let calls = 0;
  for (const key of ['', 'not-a-uuid', 'factory_visit/1939b962-87ba-49bd-ad7c-b3852b1ec769', '1939b962-87ba-49bd-ad7c-b3852b1ec769, f8d751e5-9e53-4ec2-aa39-1768d73e8c06']) {
    const response = await handleRfqRequest(request(visit, { 'Idempotency-Key': key }), env, { ...options, fetch: async () => { calls++; return acceptedProvider(); } });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { accepted: false, error: 'invalid_idempotency_key' });
  }
  assert.equal(calls, 0);
});

test('missing delivery configuration fails closed without calling the transport', async () => {
  let calls = 0;
  for (const config of [{}, { ...env, RFQ_DELIVERY_API_KEY: '' }, { ...env, RFQ_TO_EMAIL: 'invalid' }, { ...env, RFQ_FROM_EMAIL: 'bad\nvalue@example.test' }]) {
    const response = await handleRfqRequest(request(visit), config, { ...options, fetch: async () => { calls++; return acceptedProvider(); } });
    assert.equal(response.status, 503);
    assert.equal(await errorCode(response), 'receiver_unavailable');
  }
  assert.equal(calls, 0);
});

test('provider rejection, missing acceptance ID, malformed JSON and network failure never return accepted', async () => {
  for (const provider of [async () => Response.json({ message: 'Provider rejected private data' }, { status: 422 }), async () => Response.json({}), async () => Response.json({ id: '', error: 'failed' }), async () => new Response('not JSON'), async () => { throw new Error('private provider failure'); }]) {
    const response = await handleRfqRequest(request(visit), env, { ...options, fetch: provider });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { accepted: false, error: 'delivery_unavailable' });
  }
});

test('provider timeout fails closed', async () => {
  const response = await handleRfqRequest(request(visit), env, { ...options, deliveryTimeoutMs: 5, fetch: async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
  }) });
  assert.equal(response.status, 502);
  assert.equal(await errorCode(response), 'delivery_unavailable');
});

test('foreign, missing and malformed origins are rejected before transport', async () => {
  for (const origin of ['https://attacker.test', 'null', 'https://www.leanodm.com.evil.test']) {
    const response = await handleRfqRequest(request(visit, { Origin: origin }), env, options);
    assert.equal(response.status, 403);
  }
  const missing = request(visit);
  missing.headers.delete('Origin');
  assert.equal((await handleRfqRequest(missing, env, options)).status, 403);
});

test('non-POST, non-JSON, invalid JSON and invalid payloads get actionable errors', async () => {
  assert.equal((await handleRfqRequest(new Request(`${ORIGIN}/api/rfq`), env, options)).status, 405);
  assert.equal((await handleRfqRequest(request(visit, { 'Content-Type': 'text/plain' }), env, options)).status, 415);
  assert.equal((await handleRfqRequest(new Request(`${ORIGIN}/api/rfq`, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: '{' }), env, options)).status, 400);
  const invalid = await handleRfqRequest(request({ ...visit, visitors: '0' }), env, options);
  assert.equal(invalid.status, 422);
  assert.equal((await invalid.json()).fields.visitors, 'Enter a positive whole number.');
});

test('body limit works for supplied Content-Length and streamed content without it', async () => {
  const response = await handleRfqRequest(request(visit, { 'Content-Length': '50000' }), env, options);
  assert.equal(response.status, 413);
  const oversized = await handleRfqRequest(request({ ...visit, discussion: 'x'.repeat(40000) }), env, options);
  assert.equal(oversized.status, 413);
});

test('Worker preserves static asset routing and only delegates the receiver route', async () => {
  let assetCalls = 0;
  const assets = { ASSETS: { fetch: async (input) => { assetCalls++; return new Response(new URL(input.url).pathname); } } };
  const page = await worker.fetch(new Request(`${ORIGIN}/case-studies/`), assets);
  assert.equal(await page.text(), '/case-studies/');
  const unavailable = await worker.fetch(request(project), assets);
  assert.equal(unavailable.status, 503);
  assert.equal(assetCalls, 1);
});
