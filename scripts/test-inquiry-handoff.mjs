import assert from 'node:assert/strict';
import { test } from 'node:test';

const handoff = await import('../src/utils/inquiry-handoff.ts').catch(error => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});
const helper = name => {
  assert.equal(typeof handoff[name], 'function', `${name} must implement the temporary inquiry handoff`);
  return handoff[name];
};
const token = '12345678-1234-4234-8234-123456789abc';
const now = 1_800_000_000_000;
const draft = { email: 'buyer@example.com', details: 'Our initial sound book brief.', projectType: 'not-sure', market: 'Not decided', quantity: 'Not decided', timeline: 'Spring 2027', requirements: 'Languages: English, Arabic' };
const selection = { productId: 'SB-JP-10KEY', languages: ['English', 'Arabic'], otherLanguage: '', customizations: ['Audio & voice content'], projectType: 'not-sure' };
function memoryStorage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('an explicit handoff round-trips contact, brief, timeline and actual selections', () => {
  const storage = memoryStorage();
  const saved = helper('saveInquiryHandoff')(storage, draft, selection, { now, createToken: () => token });
  assert.equal(saved, token);
  const restored = helper('readInquiryHandoff')(storage, saved, { now: now + 1000 });
  assert.deepEqual(restored, { version: 1, createdAt: now, draft, selection });
  assert.equal(storage.values.size, 1);
});

test('expired and future handoffs are rejected and removed', () => {
  const storage = memoryStorage();
  helper('saveInquiryHandoff')(storage, draft, selection, { now, createToken: () => token });
  assert.equal(helper('readInquiryHandoff')(storage, token, { now: now + 30 * 60 * 1000 + 1 }), null);
  assert.equal(storage.values.size, 0);
  helper('saveInquiryHandoff')(storage, draft, selection, { now, createToken: () => token });
  assert.equal(helper('readInquiryHandoff')(storage, token, { now: now - 1000 }), null);
});

test('malicious tokens are rejected before storage access', () => {
  const storage = { getItem: () => { throw new Error('Storage must not be read'); }, setItem() {}, removeItem() {} };
  for (const value of ['', '../secret', 'javascript:alert(1)', token + '?email=buyer@example.com', 'x'.repeat(500), '__proto__']) {
    assert.equal(helper('readInquiryHandoff')(storage, value, { now }), null);
  }
});

test('a sender history snapshot wins over an older arrival token when going back', () => {
  const newer = '22345678-1234-4234-8234-123456789abc';
  assert.equal(helper('inquiryHandoffToken')(new URLSearchParams({ inquiryDraft: token }), { inquiryDraft: newer }), newer);
  assert.equal(helper('inquiryHandoffToken')(new URLSearchParams({ inquiryDraft: token }), null), token);
});

test('storage records keep only bounded inquiry fields and whitelisted selections', () => {
  const storage = memoryStorage();
  helper('saveInquiryHandoff')(storage, { ...draft, email: 'x'.repeat(300), details: 'd'.repeat(7000), projectType: 'injected', endpoint: 'https://attacker.example', attachment: 'secret.pdf' }, { productId: '<img>', languages: ['Japanese', 'Klingon', 'Japanese'], customizations: ['a'.repeat(200)], projectType: 'injected' }, { now, createToken: () => token });
  const restored = helper('readInquiryHandoff')(storage, token, { now });
  assert.equal(restored.draft.email.length, 254);
  assert.equal(restored.draft.details.length, 6000);
  assert.equal(restored.draft.projectType, 'not-sure');
  assert.equal(restored.draft.endpoint, undefined);
  assert.equal(restored.draft.attachment, undefined);
  assert.deepEqual(restored.selection.languages, ['Japanese']);
  assert.equal(restored.selection.productId, undefined);
  assert.ok(restored.selection.customizations[0].length <= 120);
});

test('restoration supplements blank fields and preserves an existing brief and deliberate route', () => {
  const merge = helper('mergeInquiryDraft');
  const existing = { email: 'existing@example.com', details: 'Existing buyer wording.', market: '', projectType: 'product-adaptation', adaptationNotes: 'Keep this note.' };
  const merged = merge(existing, { ...draft, projectType: 'existing-products', customizationNotes: 'Incoming hidden note.' });
  assert.equal(merged.email, existing.email);
  assert.equal(merged.details, existing.details);
  assert.equal(merged.market, 'Not decided');
  assert.equal(merged.timeline, 'Spring 2027');
  assert.equal(merged.projectType, 'product-adaptation');
  assert.equal(merged.adaptationNotes, 'Keep this note.');
  assert.equal(merged.customizationNotes, undefined);
  assert.equal(merge({ email: '', details: '', projectType: 'not-sure' }, { ...draft, projectType: 'new-product-development' }).projectType, 'new-product-development');
  assert.equal(merge({ email: 'autofilled@example.com', details: '', projectType: 'not-sure' }, { ...draft, projectType: 'product-adaptation' }).projectType, 'product-adaptation');
  assert.equal(merge({ details: 'An existing draft with an undecided route.', projectType: 'not-sure' }, { ...draft, projectType: 'new-product-development' }).projectType, 'not-sure');
});

test('malformed JSON, wrong versions and unavailable storage never restore a draft', () => {
  const storage = memoryStorage();
  helper('saveInquiryHandoff')(storage, draft, selection, { now, createToken: () => token });
  const key = [...storage.values.keys()][0];
  for (const value of ['null', '<html>', '{"version":99}', '{"version":1,"createdAt":0,"draft":[]}']) {
    storage.setItem(key, value);
    assert.equal(helper('readInquiryHandoff')(storage, token, { now }), null);
  }
  assert.equal(helper('readInquiryHandoff')({ getItem() { throw new Error('Denied'); }, removeItem() {} }, token, { now }), null);
  assert.throws(() => helper('saveInquiryHandoff')({ setItem() { throw new Error('Denied'); } }, draft, selection, { now, createToken: () => token }), /Denied/);
});

test('exact customization choices survive category, detail and category handoffs without semantic remapping', () => {
  const partition = helper('partitionCustomizationChoices');
  const category = ['Audio & voice content', 'Power configuration'];
  const detail = ['Authorized narration, songs or effects', 'Power and playback functions'];
  const onDetail = partition(['Audio & voice content'], detail);
  assert.deepEqual(onDetail, { checked: [], carried: ['Audio & voice content'] });
  const requested = [...onDetail.checked, detail[0], ...onDetail.carried];
  const backOnCategory = partition(requested, category);
  assert.deepEqual(backOnCategory, { checked: ['Audio & voice content'], carried: ['Authorized narration, songs or effects'] });
  const afterRemoval = partition([...backOnCategory.checked, ...backOnCategory.carried.filter(value => value !== detail[0])], category);
  assert.deepEqual(afterRemoval, { checked: ['Audio & voice content'], carried: [] });
});

test('customizations accumulated across all four catalog pages fit the temporary handoff', () => {
  const storage = memoryStorage();
  const customizations = Array.from({length: 34}, (_, index) => `Exact requested customization ${index + 1}`);
  helper('saveInquiryHandoff')(storage, draft, { ...selection, customizations }, { now, createToken: () => token });
  assert.deepEqual(helper('readInquiryHandoff')(storage, token, { now }).selection.customizations, customizations);
});
