# Appearance inspection page implementation

Implemented 2026-09-28 on `codex/appearance-inspection`. Target: `/quality/appearance-inspection/`. The owner subsequently explicitly authorized direct push and publication. The existing production channel is the repository's Cloudflare Workers integration for service `leanodm`, triggered by `main`.

## Content and design

The primary source is `E:/SEO/文章版块/鑫银海产品外观检验标准_英文翻译.docx`. Its 15 categories remain the main content. Source text is separated from page presentation in `src/data/appearance-standard.json`. All 35 photographs retain the source markings and original dimensions; lossless WebP conversion reduces their combined size from 4,228,371 to 2,912,972 bytes. Each image has a descriptive filename, English caption, specific alt text, intrinsic size, and an original-size link. Below-the-fold evidence images are lazy-loaded.

Page order: breadcrumb and evidence-led hero; purpose/scope; viewing conditions and A/B/C surfaces; CR/MA/MI severity; complete indexed defect library; customer reference-sample provisions; related functional/assembly considerations; six visible buyer FAQs; project-requirements CTA area.

The existing LEANODM wordmark, symbol, red/blue palette, sans-serif typography, Button, BaseLayout and neutral/slate treatments are reused. The long standard uses a desktop sticky index, native mobile menu, semantic two-column tables, wrapped narrow-screen text, visible focus states and reduced-motion support. Criteria and FAQs are server-rendered, never hidden behind a JavaScript interface. The standard contains 17 semantic tables and one H1. Photographs illustrate defects and do not act as a measurement scale.

The legacy shared Header/Footer still contain logistics copy and placeholder social links. An opt-in `technicalPage` BaseLayout mode prevents that content from appearing on this page without changing the six existing routes. Its scoped header/footer use a single section-navigation model. Existing site-wide architecture decisions are preserved in their specification; this task does not implement their currently absent routes. The local page navigation is a transitional scope decision, not a new site architecture.

## Source QA

See [source audit](appearance-inspection-source-qa.md) for all values, conditions, image relationships and hashes.

- Source §6.15 repeats §6.13's deformation description and both acceptance paragraphs. The page retains all three printing photos and category anchor, omits the mismatched criteria, and visibly explains the gap. The source's MA example of illegible print remains visible; no print tolerance or approval policy was invented.
- Scratch spacing remains exactly “30 mm apart”; no `≥` or “at least” was added.
- Off-color specks preserve inclusive `≤ 0.3 mm`, strict `< 0.5 mm`, and spacing `> 50 mm`. The photo caption `> 0.5 mm` remains a separate illustration, not the acceptance boundary.
- Customer sample alternatives, reflected-light conditions, transparent-part rejection, spray-painting exceptions and function/assembly/safety conditions are retained in full.
- English punctuation and spacing in headings are normalized. Source numbering is presented as 01–15 and §6.1–§6.15. No source revision/date, AQL, sampling plan, frequency, equipment, certification, performance statistics or approval procedure was invented.

All XML body/table text and embedded photos were inspected. No bundled LibreOffice was available, so original Word pagination was not rendered or assigned page numbers. That limitation does not affect the extracted acceptance tables or photographs.

## SEO and AI-search presentation

- Title: **Product Appearance Inspection Standard | LEANODM**.
- H1: **Product Appearance Inspection Standard**.
- Description: **Review Xinyinhai’s appearance inspection standard: 15 defect categories, original photographs, surface classes and measurable acceptance criteria.**
- Stable descriptive anchors for all categories; source section labels; visible measurable criteria with their surface context; explicit factory attribution; original evidence with English captions.
- `WebPage` and `BreadcrumbList` are rendered when the confirmed production origin is configured. They describe visible content; no invented organization relationship, reviews or ratings are added. The breadcrumb omits the absent Quality overview until its route exists.
- FAQs answer actual buyer questions and remain visible HTML. No FAQ rich-result promise or `FAQPage` markup.
- Related Quality and injection-molding links are included only when the corresponding Astro source route exists. They are not dead links, thin replacement pages or “coming soon” placeholders. They activate automatically when those static pages are implemented.

### External research, separate from factory facts

Search results were checked on 2026-09-28. No search-volume, ranking or AI-citation prediction is claimed. “Appearance/cosmetic inspection standard” results emphasize factory standards, viewing conditions and acceptance limits; “plastic injection molding defects” more often emphasizes identification and troubleshooting. The former is the page's primary intent; the latter is served by specific defect sections.

- [APT Mold cosmetic standard](https://www.apt-mold.com/wp-content/uploads/2024/10/APT-Cosmetic-inspection-standard.pdf): confirms supplier-standard search intent; none of its acceptance criteria were adopted.
- [BASF injection molding troubleshooting](https://plastics-rubber.basf.com/emea/en/performance_polymers/services/product_support_troubleshooting/injection_moulding_troubleshooter): technical naming context for sink marks, short shots, flash and warpage; no factory practices imported.
- [KEYENCE molding defects](https://www.keyence.com/products/microscope/digital-microscope/industries/chemistry/molding-defects.jsp): weld lines and flow lines are distinct; no keyword-driven conflation. The source's “Gas marks” is also preserved without equating it with burns or splay.
- [Google title guidance](https://developers.google.com/search/docs/appearance/title-link) and [snippet guidance](https://developers.google.com/search/docs/appearance/snippet): clear, accurate title and description.
- [Google breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [Schema.org WebPage](https://schema.org/WebPage): restrained schema matching visible content.
- [Google updates](https://developers.google.com/search/updates): records retirement of FAQ rich results in May 2026 and removal of FAQ documentation in June 2026. Visible buyer answers still have reader value.

## Production identity and contact dependency

The existing repository's `SITE.url` is `https://yourdomain.com`. The RFQ page contains fabricated template contacts and a form that only logs data and shows an alert; it does not send an enquiry. Neither is treated as a verified production value.

The user has been asked for the formal domain and a working enquiry destination. Set `PUBLIC_SITE_URL` to the confirmed HTTPS origin and `PUBLIC_CONTACT_URL` to the confirmed contact URL or `mailto:` URL at build time (`.env.example` documents these non-secret variables). Until confirmed, the local preview omits canonical/absolute schema and the outgoing contact button; header/footer links still lead to the visible project-preparation section. The preview must not be described as having a verified production canonical or working enquiry endpoint.

The owner subsequently requested direct publication of the current version despite these previously disclosed gaps. This release therefore preserves the absent values instead of inventing them: the page content can be published, but production canonical/absolute structured data and an outgoing enquiry destination remain unconfigured unless the hosting environment supplies the confirmed values. The strict release verifier continues to distinguish those gaps from the passing content checks. Category 15's missing source rule also remains an explicitly disclosed content limitation.

## Files

- `src/pages/quality/appearance-inspection/index.astro`: route, visible editorial content, metadata/schema and related-route logic.
- `src/data/appearance-standard.json`: source-derived definitions, conditions, 15 categories and image metadata.
- `public/images/quality/appearance-inspection/*.webp`: 35 evidence photographs.
- `src/styles/appearance-inspection.css`: page-only layout and responsive rules.
- `src/layouts/BaseLayout.astro`: backward-compatible technical mode and head slot.
- `src/components/TechnicalPageHeader.astro`, `TechnicalPageFooter.astro`, `technicalPageNavigation.ts`: scoped shared chrome.
- `.env.example`: confirmed origin/contact configuration contract.
- `scripts/verify-appearance.mjs`: built-HTML route, link, anchor, image, metadata and schema verification.
- `scripts/inspect-appearance-browser.cjs`: real browser checks and screenshots, including JavaScript-disabled viewports.
- `scripts/verify-appearance-source.py`: independent DOCX-to-built-HTML and original-image comparison.
- `docs/quality/appearance-inspection-source-qa.md` and this file: source issues, provenance and implementation/verification record.

## Verification

Run from `E:/WEB/LEANODM`:

```powershell
npm run build
node scripts/verify-appearance.mjs --preview
# After production origin/contact are confirmed, run the stricter release check:
node scripts/verify-appearance.mjs
& 'C:\Users\Defineless\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/verify-appearance-source.py --source 'E:\SEO\文章版块\鑫银海产品外观检验标准_英文翻译.docx'
```

The production build generates seven pages, including the target. Existing Vite/react-babel deprecation and chunk-size warnings also occur in the unchanged baseline; no new build errors.

The browser runner uses bundled Playwright with installed Chrome in headless mode:

```powershell
$env:NODE_PATH = 'C:\Users\Defineless\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:QA_OUTPUT = 'C:\Users\Defineless\Documents\ChatGPT\网站搭建\.appearance-qa'
# Keep `npm run preview -- --host 127.0.0.1 --port 4321` running separately.
node scripts/inspect-appearance-browser.cjs
```

Verified at 1440×1000 and 390×844 with JavaScript, and 320×740 and 768×1024 without JavaScript: HTTP 200, zero horizontal overflow, 15 defects, all 35 evidence images decoded, 17 tables with no overflow, one H1, no heading-level skips, correct anchor offsets below the sticky header, working native mobile menu, zero browser errors or failed requests. Desktop and mobile screenshots were visually inspected.

Independent source review found all 41 original valid acceptance paragraphs (39 table cells plus both deformation paragraphs), 7 additional requirements, all 3 conditions, all surface/severity definitions and 35 image/caption mappings in the correct visible sections. No unsupported factory claim was found.

The independent source-comparison command also passed against the final build, including all 35 decoded RGBA image comparisons. `node scripts/verify-appearance.mjs --preview` passes. Canonical, Open Graph URL, `WebPage`/`BreadcrumbList` JSON-LD and the outgoing CTA configuration were additionally exercised in an isolated build with reserved `.test` domain fixtures; the strict verifier passes for that fixture. Fixture files are outside the repository's final `dist` and are not production values. The normal final build contains no invented domain or contact details. Its strict production check intentionally remains unmet until the two owner-confirmed values are provided.
