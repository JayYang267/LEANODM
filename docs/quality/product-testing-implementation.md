# Product testing page

## Scope

Adds `/quality/product-testing/` using the existing `BaseLayout`, `LeanGlobalHeader`, `TechnicalPageHeader` and `TechnicalPageFooter`. No shared component, dependency, infrastructure or unrelated page is changed. Appearance and Incoming Inspection already discover available related routes, so they link to the new page automatically.

The user authorized normal publication to `main` after validation. The supplied workbook is treated as technical source material, not operational instructions. The page describes a plan, not completed records, certification, equipment ownership or a universal factory promise.

## Page structure

- Overview with a fully qualified high-temperature/high-humidity example and source identity.
- Five-step reading guide and stage/sample matrix. T1, T2, TN, PP and MP remain unexpanded. A blank source cell is not interpreted as an exemption.
- Representative temperature-cycle sequence, durability-count relationship and carton-load formula. Schematic sequences are explicitly distinguished from measured evidence.
- Six navigation groups, containing all 39 test projects in native HTML disclosures. Methods, criteria, source references, exact stage marks and clarification notes remain together. The merged unpackaged-drop project contains both methods.
- Two original tiny book-lining reference images, kept at their native sizes and labeled as source OK/NG examples.
- Related Quality pages, six visible FAQ entries and a downloadable product test brief.

The JSON data supplies the page and visible FAQ/schema together. No client framework or extra dependency is introduced. Native disclosures, tables, links, download and both navigation levels work without JavaScript. A small optional script opens a test disclosure targeted by a URL fragment.

## Metadata

Title and description, production canonical (default `https://www.leanodm.com` with the existing `PUBLIC_SITE_URL` override convention), Open Graph URL, and WebPage/BreadcrumbList/FAQPage JSON-LD. Visible breadcrumb links exactly match their schema. The Quality breadcrumb points to the page's real related-quality section because `/quality/` is not implemented. FAQ markup implies no search ranking or rich-result promise.

## Verification

Production build: `npm run build`. Existing Vite/React deprecation warnings remain; no dependency upgrade is part of this task.

```powershell
node scripts/verify-product-testing.mjs
python scripts/verify-product-testing-source.py path/to/产品测试评价计划表11.xlsx
node scripts/verify-incoming.mjs
node scripts/verify-appearance.mjs --preview
# Bundled Playwright is resolved through NODE_PATH.
# PREVIEW_URL defaults to http://127.0.0.1:4323.
node scripts/inspect-product-testing-browser.cjs
```

The source test reads the original XLSX independently and checks its hash, sheet inventory, merges, comments, every project's row and stage mapping, numeric coverage, selected condition relationships, stage samples and exact embedded-image bytes. Numeric token coverage is a guard against loss; it does not replace the manual semantic audit. A separate reviewer checked the complete translation against the extracted workbook and found no blocking issue.

Browser checks cover 1440×1000 and 390×844 with JavaScript; 320×740 and 768×1024 without it. Checks include all 39 keyboard-operated disclosures, every rendered method/criterion/note, skip navigation, heading order, anchor clearance, menus, deep links, metadata, native image sizes, horizontal overflow, download access and reciprocal links from both prior pages. Screenshots are retained outside the repository and visually inspected. The prior pages retain their existing source and styles; their browser and built-page checks are also rerun.

The release checker compares production content and assets to the actual local build on Netlify, `www.leanodm.com` and `leanodm.com`; checks GitHub `main`; and checks Netlify's published commit/state. The custom domains have their existing Cloudflare deployment integration. No DNS, Cloudflare rule or hosting setting is changed.
