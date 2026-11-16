export const FACTORY_TIME_ZONE = 'Asia/Shanghai';
export type VisitDraft = {
  name: string;
  email: string;
  preferredDate: string;
  timeZone: string;
  company?: string;
  preferredTime?: 'morning' | 'afternoon' | 'no-preference';
  visitors?: string;
  discussion?: string;
  source?: string;
};
export type VisitErrors = Partial<Record<'name' | 'email' | 'preferredDate' | 'visitors', string>>;

export function factoryToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: FACTORY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function readVisit(data: FormData): VisitDraft {
  const value = (key: string) => typeof data.get(key) === 'string' ? String(data.get(key)).trim() : '';
  const draft: VisitDraft = { name: value('name'), email: value('email'), preferredDate: value('preferredDate'), timeZone: FACTORY_TIME_ZONE };
  for (const key of ['company', 'visitors', 'discussion', 'source'] as const) if (value(key)) draft[key] = value(key);
  const time = value('preferredTime');
  if (time === 'morning' || time === 'afternoon' || time === 'no-preference') draft.preferredTime = time;
  return draft;
}

export function validateVisit(draft: Partial<VisitDraft>, now = new Date()): VisitErrors {
  const errors: VisitErrors = {};
  if (!draft.name?.trim() || draft.name.length > 120) errors.name = 'Enter your full name (up to 120 characters).';
  if (!draft.email?.trim() || draft.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = 'Enter a valid email address so we can confirm the arrangements.';
  const date = draft.preferredDate ?? '';
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < factoryToday(now)) errors.preferredDate = 'Choose today or a future date in China Standard Time (UTC+8).';
  if (draft.visitors && (!/^[1-9]\d*$/.test(draft.visitors) || !Number.isSafeInteger(Number(draft.visitors)))) errors.visitors = 'Enter a positive whole number of visitors, or leave this blank.';
  return errors;
}

export function formatVisit(draft: VisitDraft): string {
  const lines = ['Factory Visit Request — LEANODM', '', `Full name: ${draft.name}`, `Email: ${draft.email}`, `Preferred visit date: ${draft.preferredDate}`, 'Factory local time — China Standard Time (UTC+8); Asia/Shanghai'];
  const timeLabels = { morning: 'Morning', afternoon: 'Afternoon', 'no-preference': 'No preference' };
  if (draft.preferredTime) lines.push(`Preferred time: ${timeLabels[draft.preferredTime]}`);
  if (draft.company) lines.push(`Company: ${draft.company}`);
  if (draft.visitors) lines.push(`Number of visitors: ${draft.visitors}`);
  if (draft.discussion) lines.push('', 'What I would like to discuss:', draft.discussion);
  if (draft.source) lines.push('', `Source page: ${draft.source}`);
  lines.push('', 'This visit request is subject to confirmation. The team will email to confirm the date and arrangements.');
  return lines.join('\n');
}

export function emailVisitUrl(draft: VisitDraft): string {
  return `mailto:quotes@leanodm.com?subject=${encodeURIComponent('Factory Visit Request — LEANODM')}&body=${encodeURIComponent(formatVisit(draft))}`;
}

export async function sendVisit(endpoint: string | null, draft: VisitDraft, options: { fetchImpl?: typeof fetch; timeoutMs?: number; idempotencyKey?: string } = {}): Promise<{ accepted: true }> {
  if (!endpoint) throw new Error('No factory visit receiver is configured.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const response = await (options.fetchImpl ?? fetch)(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}) },
      body: JSON.stringify({ ...draft, request_type: 'factory_visit' }),
      credentials: 'same-origin', redirect: 'error', signal: controller.signal,
    });
    if (!response.ok) throw new Error('The visit request could not be accepted.');
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== 'object' || !('accepted' in receipt) || receipt.accepted !== true) throw new Error('Acceptance was not confirmed.');
    return { accepted: true };
  } finally {
    clearTimeout(timer);
  }
}
