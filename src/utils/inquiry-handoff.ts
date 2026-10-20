import type { InquiryDraft, ProjectType } from './rfq';

export const INQUIRY_HANDOFF_PARAM = 'inquiryDraft';
export const INQUIRY_HANDOFF_TTL = 30 * 60 * 1000;
const prefix = 'leanodm:inquiry-handoff:';
const tokenPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const projectTypes = new Set(['existing-products', 'product-adaptation', 'new-product-development', 'oem-manufacturing', 'not-sure']);
const languages = new Set(['English', 'Japanese', 'Arabic', 'Other']);
const limits = { email: 254, details: 6000, name: 120, company: 160, quantity: 120, market: 200, timeline: 200, referenceLinks: 2000, requirements: 2000, source: 500, customizationNotes: 3000, adaptationNotes: 3000, developmentNotes: 3000, oemNotes: 3000 } as const;
const noteFields = { 'existing-products': 'customizationNotes', 'product-adaptation': 'adaptationNotes', 'new-product-development': 'developmentNotes', 'oem-manufacturing': 'oemNotes' } as const;

export type InquirySelection = {
  productId?: string;
  languages?: string[];
  otherLanguage?: string;
  customizations?: string[];
  projectType?: ProjectType;
};
export type InquiryHandoff = { version: 1; createdAt: number; draft: InquiryDraft; selection: InquirySelection };
type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
function text(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.slice(0, limit).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim() : '';
}
function projectType(value: unknown): ProjectType {
  return typeof value === 'string' && projectTypes.has(value) ? value as ProjectType : 'not-sure';
}
function sanitizeDraft(value: unknown): InquiryDraft {
  const input = record(value) ? value : {};
  const result: InquiryDraft = { email: text(input.email, limits.email), details: text(input.details, limits.details), projectType: projectType(input.projectType) };
  for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
    const content = text(input[field], limits[field]);
    if (content) result[field] = content;
  }
  for (const [type, field] of Object.entries(noteFields)) if (type !== result.projectType) delete result[field as 'customizationNotes' | 'adaptationNotes' | 'developmentNotes' | 'oemNotes'];
  return result;
}
function sanitizeSelection(value: unknown): InquirySelection {
  const input = record(value) ? value : {};
  const productId = text(input.productId, 80);
  const result: InquirySelection = {
    languages: Array.isArray(input.languages) ? [...new Set(input.languages.filter((item): item is string => typeof item === 'string' && languages.has(item)))].slice(0, 4) : [],
    otherLanguage: text(input.otherLanguage, 120),
    customizations: customizationValues(input.customizations),
    projectType: projectType(input.projectType),
  };
  if (/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(productId)) result.productId = productId;
  return result;
}

function customizationValues(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.map(item => text(item, 120)).filter(Boolean))].slice(0, 64) : [];
}

// A page may offer different controls. Preserve unmatched customer wording
// instead of treating a similarly named option as the same requested change.
export function partitionCustomizationChoices(requested: readonly string[], available: readonly string[]): { checked: string[]; carried: string[] } {
  const choices = customizationValues(requested);
  const controls = new Set(available);
  return { checked: choices.filter(value => controls.has(value)), carried: choices.filter(value => !controls.has(value)) };
}

export function saveInquiryHandoff(storage: Pick<StorageAccess, 'setItem'>, draft: Partial<InquiryDraft>, selection: InquirySelection, options: { now?: number; createToken?: () => string } = {}): string {
  const token = (options.createToken ?? (() => crypto.randomUUID()))();
  if (!tokenPattern.test(token)) throw new Error('Could not create a temporary inquiry token.');
  const payload: InquiryHandoff = { version: 1, createdAt: options.now ?? Date.now(), draft: sanitizeDraft(draft), selection: sanitizeSelection(selection) };
  storage.setItem(prefix + token, JSON.stringify(payload));
  return token;
}

export function readInquiryHandoff(storage: Pick<StorageAccess, 'getItem' | 'removeItem'>, token: unknown, options: { now?: number } = {}): InquiryHandoff | null {
  if (typeof token !== 'string' || !tokenPattern.test(token)) return null;
  try {
    const raw = storage.getItem(prefix + token);
    if (!raw || raw.length > 50000) return null;
    const payload: unknown = JSON.parse(raw);
    const now = options.now ?? Date.now();
    if (!record(payload) || payload.version !== 1 || typeof payload.createdAt !== 'number' || !Number.isFinite(payload.createdAt) || payload.createdAt > now || now - payload.createdAt > INQUIRY_HANDOFF_TTL || !record(payload.draft) || !record(payload.selection)) {
      storage.removeItem(prefix + token);
      return null;
    }
    return { version: 1, createdAt: payload.createdAt, draft: sanitizeDraft(payload.draft), selection: sanitizeSelection(payload.selection) };
  } catch {
    return null;
  }
}

// Existing buyer wording always wins. A blank form's default route may inherit
// an explicit route; an existing undecided brief keeps its undecided route.
export function mergeInquiryDraft(existing: Partial<InquiryDraft>, incoming: Partial<InquiryDraft>): InquiryDraft {
  const restored = sanitizeDraft(incoming);
  const result: InquiryDraft = { ...restored };
  for (const field of Object.keys(limits) as (keyof typeof limits)[]) {
    if (typeof existing[field] === 'string' && existing[field]!.trim()) result[field] = existing[field]!;
  }
  const currentType = projectType(existing.projectType);
  result.projectType = currentType !== 'not-sure' || Boolean(existing.details?.trim()) ? currentType : restored.projectType;
  for (const [type, field] of Object.entries(noteFields)) if (type !== result.projectType) delete result[field as 'customizationNotes' | 'adaptationNotes' | 'developmentNotes' | 'oemNotes'];
  return result;
}

export function inquiryHandoffToken(search: URLSearchParams, state: unknown): string | null {
  const historyToken = record(state) ? state[INQUIRY_HANDOFF_PARAM] : null;
  const token = typeof historyToken === 'string' && tokenPattern.test(historyToken) ? historyToken : search.get(INQUIRY_HANDOFF_PARAM);
  return typeof token === 'string' && tokenPattern.test(token) ? token : null;
}
