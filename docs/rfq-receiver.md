# RFQ and factory visit receiver

The repository now includes a receiver adapter on the existing Cloudflare Worker static-assets stack. No delivery credentials have been supplied or verified for this work. Both public endpoint variables remain blank by default, so the page keeps its copy/email-draft alternatives. No production deployment, real email, durable record or calendar booking has been verified.

`src/worker.mjs` handles only `/api/rfq`; other requests continue to the `ASSETS` binding. The existing Worker name, compatibility date, Astro framework and static build directory are preserved. Wrangler's selective `run_worker_first` applies only to `/api/rfq`.

## Configuration still required

The optional adapter uses the Resend HTTP API at a fixed `https://api.resend.com/emails` URL. It adds no SDK dependency and creates no account. The responsible administrator must choose/approve this service and configure a verified sender before enabling it. An alternative authorized transport can replace the small delivery block in `src/server/rfq-receiver.mjs` without changing either form contract.

Set these **Worker runtime secrets**, through the existing deployment's secret configuration when authorized:

| Name | Required value |
| --- | --- |
| `RFQ_DELIVERY_API_KEY` | API key authorized to send from the approved sender |
| `RFQ_FROM_EMAIL` | Verified sender email address; plain address only |
| `RFQ_TO_EMAIL` | Owner-confirmed receiving email address; plain address only |

No recipient is invented or defaulted. Confirm the mailbox and its privacy responsibilities with the owner. Do not place these values in source, `wrangler.toml`, public build variables or committed environment files. `.dev.vars.example` contains blank placeholders; actual `.dev.vars` files are ignored. Local QA should leave credentials blank and use the mock tests below, which cannot send email.

After the responsible administrator verifies reception in an authorized environment, set build-time `PUBLIC_RFQ_ENDPOINT=/api/rfq` and rebuild the site. `PUBLIC_FACTORY_VISIT_ENDPOINT` may remain blank because visits reuse the RFQ endpoint; it is only needed for an independently configured visit receiver. These public endpoint variables contain URLs, never credentials. A separately hosted receiver must implement its own origin policy; the included receiver accepts only an exact same-origin `Origin` header.

## Request contract

Send a same-origin JSON `POST /api/rfq` with `Content-Type: application/json` and the browser's `Origin`. The receiver rejects other methods, missing/foreign origins, invalid JSON, bodies over 32 KiB and unsupported fields. Text has explicit length limits, and email/header fields reject line breaks. It never logs request bodies or sends customer details to analytics.

The optional `Idempotency-Key` request header must be an opaque UUID in its canonical hyphenated format; malformed or empty supplied values return `400 invalid_idempotency_key`. The receiver forwards it to Resend as `factory_visit/<uuid>` or `project_inquiry/<uuid>`, separating the request types. Existing integrations may omit this header and retain the original contract.

`request_type: "project_inquiry"` identifies project inquiries. For backward compatibility, omitting `request_type` still means a project inquiry. The existing payload is preserved:

- Required: `email`, `details`, `projectType`.
- `projectType`: `existing-products`, `product-adaptation`, `new-product-development`, `oem-manufacturing` or `not-sure`.
- Optional strings: `name`, `company`, `quantity`, `market`, `timeline`, `referenceLinks`, `requirements`, `ndaRequest`, `source`, `customizationNotes`, `adaptationNotes`, `developmentNotes`, `oemNotes`.
- `referenceLinks` contains complete HTTP/HTTPS links without embedded credentials. `ndaRequest`, if supplied, uses the existing supported NDA request text.

`request_type: "factory_visit"` identifies visit applications:

- Required user fields: `name`, `email`, `preferredDate` (`YYYY-MM-DD`).
- The form supplies `timeZone: "Asia/Shanghai"`; another time zone is rejected.
- Optional strings: `company`, `preferredTime` (`morning`, `afternoon`, `no-preference`), `visitors`, `discussion`, `source`.
- `visitors`, when supplied, contains a positive safe whole number. No visit capacity limit is invented.
- The date must be a real calendar date and at least today's date **in Asia/Shanghai**, independent of the visitor's time zone. The date does not imply available inventory, working days, hours or an automatic reservation.

The optional `source` string can retain relevant referring page and UTM context (up to 2,000 characters). Do not put contact details or confidential project text in URLs or analytics events. Fields are strictly allowlisted by request type; RFQ fields are rejected in a visit application and vice versa.

The email subject is `Factory Visit Request — LEANODM` or `Project Inquiry / RFQ — LEANODM`. The plain-text body identifies request type, the actual preferred visit date, fixed factory time zone, and only the customer's supplied optional values. The visit text says arrangements require confirmation.

## Acceptance and failure

The receiver returns HTTP `202` with exactly `{"accepted":true}` only after the configured provider returns successful HTTP status and a nonempty acceptance ID. This means the provider accepted the message request. It does **not** prove mailbox delivery or confirm a factory visit. No auto-reply or calendar integration is implemented.

Failures return `{"accepted":false,"error":"..."}` with a non-success status. Validation also supplies a `fields` map. Missing/invalid configuration returns `503 receiver_unavailable`; provider rejection, malformed response, network failure or ten-second timeout returns `502 delivery_unavailable`. Provider errors and secrets are never exposed in the response. Responses use `Cache-Control: no-store`.

The page must keep the customer's input and permit retry or use of its copy/email-draft alternatives. Copying and opening an email draft still require the customer to send it. The forms send a stable per-draft UUID in `Idempotency-Key`, reuse it after a failed or ambiguous attempt, and generate a new UUID after an edit/reset. Resend retains keys for **24 hours** and replays the original response for an unchanged request with the same key without sending another notification. This protects keyed retries when the provider accepted a request but its response was lost. It does not prove mailbox delivery. After the retention window, or for legacy requests without the header, a manual retry can still create a second application; there is no additional durable deduplication store. Before enabling a public receiver, review abuse controls and rate limits in the existing account; none are represented as already configured.

## Local verification

Run the deterministic validation, HTTP-handler and mocked-provider tests:

```sh
node --test scripts/test-rfq-receiver.mjs
```

Tests cover the legacy RFQ contract, each request type, UTC/China date boundaries, real calendar dates, positive visitor counts, strict fields, origins, body limits, per-type mail content, missing configuration, provider acceptance/rejection, malformed responses, network failure, timeout, static-asset delegation, keyed retry after a lost provider response, cross-type key separation, malformed keys and legacy requests without a key. The transport is injected inside tests only; no application environment variable enables a fake accepted result.

For a local Cloudflare runtime check, build the site and start Wrangler locally with blank delivery secrets. `/api/rfq` should return `503` for an otherwise valid request and should never claim acceptance. A local Wrangler bundle dry run is packaging only; do not publish, push or change production account settings without a separate publishing instruction.

Official references consulted: [Cloudflare static-assets Worker routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), [Cloudflare Workers guidance](https://github.com/cloudflare/skills/tree/main/skills/workers-best-practices), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email), [Resend idempotency keys and 24-hour retention](https://resend.com/docs/dashboard/emails/idempotency-keys). Netlify config/framework references are installed under `.agents/skills/` for comparison with the existing stack; Netlify Forms/Functions were not introduced.
