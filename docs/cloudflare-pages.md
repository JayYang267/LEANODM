# Cloudflare Pages deployment

Connect the existing `JayYang267/LEANODM` repository in Pages. Set the production branch to `codex/cloudflare-pages`, run `npm run build`, and use `dist` as the output directory. The Node version is pinned in `.node-version`. Work from `E:/WEB/LEANODM` for changes and release validation.

Pages Functions handle `/api/rfq` for the factory visit and project inquiry forms. Both use text and can include reference links. The existing inquiry address is `quotes@leanodm.com`.

Configure these runtime variables in **Workers & Pages → Pages project → Settings → Variables and Secrets**. Set them in the environment used for the release candidate and redeploy.

| Name | Value |
| --- | --- |
| `RFQ_DELIVERY_API_KEY` | Resend sending-only API key, stored as a secret |
| `RFQ_FROM_EMAIL` | Address on an existing verified Resend sending domain, or on a dedicated verified subdomain such as `notifications@forms.leanodm.com` |
| `RFQ_TO_EMAIL` | `quotes@leanodm.com` |

If a sending subdomain is needed, add only Resend’s verification records for that subdomain. Keep the Tencent enterprise mail MX and SPF records on `leanodm.com` intact.

On the Pages URL, submit a `TEST` request through each form with distinct reference text. Confirm both messages are present in the receiving mailbox and any final forwarded inbox. Verify the recorded links open from the inquiry email. Check the existing cases, redirects, canonical, sitemap, robots, video playback and captions on the Pages URL. The `pages.dev` host uses `X-Robots-Tag` to prevent indexing.

After preview acceptance, record the current Worker `leanodm` deployment and its `leanodm.com` and `www.leanodm.com` bindings before moving those two domains to the Pages project. Retain the Worker and its `main` source for rollback. Leave unrelated DNS records, including mail and wildcard records, intact. The canonical origin is `https://www.leanodm.com`. After HTTPS is active, repeat the public checks and both mailbox receipt tests. To roll back, verify the previous Worker deployment is healthy and then restore the two original bindings.
