export const PROJECT_TYPES = {
  'existing-products': 'Existing Product Customization',
  'product-adaptation': 'Product Adaptation',
  'new-product-development': 'New Product Development',
  'oem-manufacturing': 'OEM Manufacturing',
  'not-sure': 'Not sure — help me choose',
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;
export type InquiryDraft = {
  email: string;
  details: string;
  projectType: ProjectType;
  name?: string;
  company?: string;
  quantity?: string;
  market?: string;
  timeline?: string;
  referenceLinks?: string;
  requirements?: string;
  source?: string;
  customizationNotes?: string;
  adaptationNotes?: string;
  developmentNotes?: string;
  oemNotes?: string;
};
export type InquiryErrors = Partial<Record<'email' | 'details' | 'referenceLinks', string>>;

const noteFields = {
  'existing-products': 'customizationNotes',
  'product-adaptation': 'adaptationNotes',
  'new-product-development': 'developmentNotes',
  'oem-manufacturing': 'oemNotes',
} as const;
const optionalFields = ['name', 'company', 'quantity', 'market', 'timeline', 'referenceLinks', 'requirements', 'source'] as const;

function projectType(value: string): ProjectType | undefined {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');
  if (Object.hasOwn(PROJECT_TYPES, normalized)) return normalized as ProjectType;
  for (const [type, label] of Object.entries(PROJECT_TYPES)) {
    if (label.toLowerCase().replace(/\s+/g, '-') === normalized) return type as ProjectType;
  }
  return normalized === 'not-sure-yet' ? 'not-sure' : undefined;
}

export function readDraft(data: FormData): InquiryDraft {
  const value = (field: string) => {
    const input = data.get(field);
    return typeof input === 'string' ? input.trim() : '';
  };
  const type = projectType(value('projectType')) ?? 'not-sure';
  const draft: InquiryDraft = { email: value('email'), details: value('details'), projectType: type };
  for (const field of optionalFields) if (value(field)) draft[field] = value(field);
  if (type !== 'not-sure') {
    const field = noteFields[type];
    if (value(field)) draft[field] = value(field);
  }
  return draft;
}

function referenceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validateDraft(draft: Partial<InquiryDraft>): InquiryErrors {
  const errors: InquiryErrors = {};
  const email = draft.email?.trim() ?? '';
  if (!email) errors.email = 'Enter an email address so we can reply.';
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address. Personal email addresses are welcome.';
  if (!draft.details?.trim()) errors.details = 'Describe the product or project you want to discuss.';
  if (draft.referenceLinks?.trim() && !draft.referenceLinks.trim().split(/\s+/).every(referenceUrl)) {
    errors.referenceLinks = 'Use complete http:// or https:// links, one per line.';
  }
  return errors;
}

function queryText(value: string | null, limit: number): string {
  return (value ?? '').slice(0, limit).replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
}

export function readQueryDraft(query: URLSearchParams, existing: Partial<InquiryDraft>): Partial<InquiryDraft> {
  const values: Partial<InquiryDraft> = {};
  const first = (names: string[], limit: number) => {
    for (const name of names) {
      const text = queryText(query.get(name), limit);
      if (text) return text;
    }
    return '';
  };
  const type = projectType(first(['projectType', 'type', 'service'], 80));
  if (type && (!existing.projectType || existing.projectType === 'not-sure')) values.projectType = type;
  const details = first(['details', 'message', 'brief'], 5000);
  if (details && !existing.details?.trim()) values.details = details;
  for (const field of ['quantity', 'market', 'timeline'] as const) {
    const value = first([field], 200);
    if (value && !existing[field]?.trim()) values[field] = value;
  }
  const reference = first(['reference', 'url'], 1000);
  if (reference && referenceUrl(reference) && !existing.referenceLinks?.trim()) values.referenceLinks = reference;
  const source = first(['source'], 200);
  const product = first(['product'], 150);
  const model = first(['model'], 150);
  const context = [source, product && `Product: ${product}`, model && `Model: ${model}`].filter(Boolean).join('; ').slice(0, 500);
  if (context && !existing.source?.trim()) values.source = context;
  return values;
}

export function resolveEndpoint(config: string, origin: string): string | null {
  const value = config.trim();
  if (!value) return null;
  const sameOriginPath = value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
  const url = new URL(value, origin);
  const absoluteHttps = /^https:\/\/[^/?#\\\s]+(?:[/?]|$)/i.test(value);
  if (/\s|[\u0000-\u001f\u007f]/.test(value) || (!sameOriginPath && !absoluteHttps) || url.username || url.password || url.hash || (sameOriginPath && url.origin !== new URL(origin).origin)) {
    throw new Error('The inquiry service is unavailable. Please use the email or copy option.');
  }
  return url.href;
}

const briefFields: [keyof InquiryDraft, string][] = [
  ['email', 'Reply email'], ['name', 'Name'], ['company', 'Company'],
  ['quantity', 'Quantity'], ['market', 'Target market'], ['timeline', 'Timeline'],
  ['referenceLinks', 'Reference links'], ['requirements', 'Requirements'], ['source', 'Project context'],
];

export function formatBrief(draft: InquiryDraft): string {
  const lines = ['LEANODM project inquiry', '', `Project type: ${PROJECT_TYPES[draft.projectType]}`, '', 'Project description:', draft.details.trim()];
  for (const [field, label] of briefFields) if (draft[field]?.trim()) lines.push('', `${label}:`, draft[field]!.trim());
  if (draft.projectType !== 'not-sure') {
    const notes = draft[noteFields[draft.projectType]]?.trim();
    if (notes) lines.push('', `${PROJECT_TYPES[draft.projectType]} notes:`, notes);
  }
  return lines.join('\n');
}

export function emailBriefUrl(draft: InquiryDraft): string {
  return `mailto:quotes@leanodm.com?subject=${encodeURIComponent('LEANODM project inquiry')}&body=${encodeURIComponent(formatBrief(draft))}`;
}

export async function sendInquiry(
  endpoint: string | null,
  draft: InquiryDraft,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<{ accepted: true }> {
  if (!endpoint) throw new Error('No inquiry service is configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const response = await (options.fetchImpl ?? fetch)(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(draft),
      credentials: 'same-origin',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('The inquiry service did not accept this request.');
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== 'object' || !('accepted' in receipt) || receipt.accepted !== true) {
      throw new Error('The inquiry service did not confirm acceptance.');
    }
    return { accepted: true };
  } finally {
    clearTimeout(timeout);
  }
}

export async function copyBrief(text: string, writeText?: (text: string) => Promise<void>): Promise<{ copied: boolean; text: string }> {
  if (writeText) {
    try {
      await writeText(text);
      return { copied: true, text };
    } catch {
      // The caller displays selectable text when clipboard permission is denied.
    }
  }
  return { copied: false, text };
}
