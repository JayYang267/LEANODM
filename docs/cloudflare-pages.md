# Cloudflare Pages deployment

Connect the existing `JayYang267/LEANODM` repository in Pages. Use `main` as the production branch and the approved integration branch for preview acceptance. Use `npm run build` and output directory `dist`. The Node version is pinned in `.node-version`. Prepare and validate both builds in the sole source checkout, `E:/WEB/LEANODM`.

Pages Functions handle `/api/rfq` for the factory visit and project inquiry forms. Both use text and can include reference links. The existing inquiry address is `quotes@leanodm.com`. Set the build-time environment variable `PUBLIC_RFQ_ENDPOINT=/api/rfq` in the Pages environment when validating or enabling direct submission. Builds without this setting provide copy and email-draft actions.

Pages sets `CF_PAGES=1` for the build. For each large video listed in `public/.assetsignore`, the Astro build checks its existing external 302 in `public/_redirects` and removes the local copy only from the generated Pages output. The original video files stay in place for local previews.

The top-level `404.html` from `src/pages/404.astro` makes removed URLs, including `/products/`, return HTTP 404 on Pages.

Configure these runtime variables in **Workers & Pages → Pages project → Settings → Variables and Secrets**. Set them in the environment used for the release candidate and redeploy.

| Name | Value |
| --- | --- |
| `RFQ_DELIVERY_API_KEY` | Resend sending-only API key, stored as a secret |
| `RFQ_FROM_EMAIL` | Address on an existing verified Resend sending domain, or on a dedicated verified subdomain such as `notifications@forms.leanodm.com` |
| `RFQ_TO_EMAIL` | `quotes@leanodm.com` |

If a sending subdomain is needed, add only Resend’s verification records for that subdomain. Keep the Tencent enterprise mail MX and SPF records on `leanodm.com` intact.

On the Pages URL, submit a `TEST` request through each form with distinct reference text. Confirm both messages are present in the receiving mailbox and any final forwarded inbox. Verify the recorded links open from the inquiry email. Check the existing cases, redirects, canonical, sitemap, robots, video playback and captions on the Pages URL. The `pages.dev` host uses `X-Robots-Tag` to prevent indexing.

After preview acceptance, record the current Worker `leanodm` deployment and its `leanodm.com` and `www.leanodm.com` bindings before moving those two domains to the Pages project. Keep the existing Worker deployment for rollback. Its same-checkout configuration is `wrangler.worker.toml`. Leave unrelated DNS records, including mail and wildcard records, intact. The canonical origin is `https://www.leanodm.com`. After HTTPS is active, repeat the public checks and both mailbox receipt tests. To roll back, verify the previous Worker deployment is healthy and then restore the two original bindings.
