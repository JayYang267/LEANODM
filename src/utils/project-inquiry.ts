import type { InquiryDraft } from './rfq';

// Only /rfq/ imports this transport. The original shared rfq.ts utility remains
// unchanged for product-detail copy, email and handoff interactions.
export async function sendProjectInquiry(
  endpoint: string | null,
  draft: InquiryDraft,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number; idempotencyKey?: string } = {},
): Promise<{ accepted: true }> {
  if (!endpoint) throw new Error('No inquiry service is configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const response = await (options.fetchImpl ?? fetch)(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}) },
      body: JSON.stringify({ ...draft, request_type: 'project_inquiry' }),
      credentials: 'same-origin', redirect: 'error', signal: controller.signal,
    });
    if (!response.ok) throw new Error('The inquiry service did not accept this request.');
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== 'object' || !('accepted' in receipt) || receipt.accepted !== true) throw new Error('The inquiry service did not confirm acceptance.');
    return { accepted: true };
  } finally { clearTimeout(timeout); }
}
