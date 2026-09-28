# Incoming material inspection implementation

## Outcome and scope

Publish `/quality/incoming-inspection/` as an English, source-grounded reading of Xinyinhai document **TV-QM-S001**, effective **13 August 2021**. The supplied document does not establish its current revision status. The page serves supplier-quality, engineering and procurement readers assessing incoming materials.

The user authorized source QA, design decisions, implementation, verification, commit/push to `main` and production publication. No separate design approval is required. Later clarification replaces an outgoing enquiry destination with a downloadable inspection-project brief; no contact form or invented address is added.

## Structure and visual decisions

- Breadcrumbs and an IQC hero with a technical control panel: 25–30 cm, 45°, 5 seconds, 40 W / 1.5–2 m lighting conditions and unaided eyesight ≥ 0.7.
- Scope, source identity/date, single normal General Level II sampling reference, acceptance-level labels and CR/MAJ/MIN definitions.
- Five navigation groups containing all 20 source material types and **199** source-linked rows. Each material uses a native disclosure. Desktop tables become labeled cards on narrow screens, while the semantic HTML remains present without JavaScript.
- Ten method cards distinguish visual/sample comparison, measurement, trial fit, function, barcode, weight, solderability, pull/seam and rubbing checks. Methods depend on the particular row; a test named in a criterion is distinguished from the literal method-column entry.
- Three original-document crops, with adjacent English interpretation, source locations, intrinsic dimensions and full-size links. They are lossless WebP encodings of the rendered evidence, with no altered source text or stars.
- Customer-specific requirements, related Quality content, seven FAQ answers, and a practical text brief download.

The composition uses the established LEANODM navy, blue, red, typography and 1280 px width. Navigation SVGs and the 45-degree viewing schematic explain relationships; they are not represented as photographic inspection evidence. No stock or AI-generated factory images are used.

## Source handling

See `incoming-inspection-source-qa.md` for the full row coverage, provenance and unresolved issues. The complete original is not republished as a scanned table or added to the Git repository. The working extraction remains outside the production repository.

All 199 populated criteria are represented. Positive acceptance statements are labeled as requirements. Nine blank method cells remain unspecified; two dual severity marks and one blank mark remain explicit. Conflicting scratch classifications, wire/material exemption applicability, ambiguous lamp count, incomplete fabric force and PVC weight specifications are qualified rather than repaired by inference.

The 43 quantitative source rows were independently compared with the final data. Source severity totals are 150 MAJ-only, 38 MIN-only, 8 CR-only, 2 CR/MAJ double marks and 1 unmarked row. No rejection rate, inspection frequency, team size, equipment count, certification or replacement sampling standard is asserted.

## SEO and machine readability

- Title: **Incoming Material Inspection Standard (IQC) | LEANODM**.
- Canonical: `https://www.leanodm.com/quality/incoming-inspection/`.
- Descriptive metadata and Open Graph URL.
- WebPage, BreadcrumbList and FAQPage JSON-LD, with FAQ answers matching rendered HTML. This does not imply eligibility for any particular rich result.
- Material-specific IDs, table captions, column/row headers, descriptive source references, document identity/date, exact units, definitions and relationships between criteria and methods.
- A reciprocal related-page link from Appearance Inspection makes the new reference discoverable through existing Quality content.

Terminology was checked against ASQ's [sampling overview](https://asq.org/quality-resources/sampling) and [quality glossary](https://asq.org/quality-resources/quality-glossary). MIL-STD-105E is treated as the internal document's historical reference, not as a current certification or a claim of adopting a replacement; DLA's [canceled-document guidance](https://www.dsp.dla.mil/Policy-Guidance/FAQs/Canceled-Documents/) was consulted for that distinction. External material does not replace the proprietary criteria.

## Verification commands

```powershell
npm run build
node scripts/verify-incoming.mjs
python scripts/verify-incoming-source.py --rows path/to/inspection-rows.json --original path/to/IQC-source.doc
node scripts/verify-appearance.mjs --preview
$env:NODE_PATH = 'C:\Users\Defineless\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:QA_OUTPUT = 'C:\Users\Defineless\Documents\ChatGPT\网站搭建\.incoming-qa'
node scripts/inspect-incoming-browser.cjs
```

The browser script targets a separate preview on port 4322 and checks 1440/390 px with JavaScript plus 320/768 px with JavaScript disabled. It opens all 20 material disclosures, compares every criterion with server-rendered text, checks evidence-image decoding, metadata, anchors, heading order and mobile menus. Regression assertions check full-width mobile row titles and the compact control-panel heading.

Initial visual QA detected a CSS-specificity conflict keeping stacked row headings at 18% width, an oversized mobile control-panel heading, and low-contrast source references. These were corrected before release. Build warnings inherited from the existing Astro/React/Vite setup are recorded in the build log; no dependency upgrade is included.

The independent original-to-data comparison passed for all 199 rows, exact severity marks, nine blank methods and literal numeric coverage. The three published WebP excerpts were compared pixel-for-pixel with their original PNG crops and match exactly. Desktop/mobile screenshots were inspected after the corrections. Final browser verification covers all four viewports with zero page overflow, zero narrow mobile row titles, zero navigation overlap, one H1, no broken anchors, 20 tables, all 199 criteria and three decoded document images. The downloadable brief returns HTTP 200.

While this page was being completed, the user authorized coordination with the Appearance Inspection chat, which upgraded the shared global navigation in commits `a6a75bf` and `21b3870`. Incoming reuses that global header, separate page navigation and footer. The project-preparation CTA label is passed through the shared layout, and anchor offsets account for the two-level header. Planned site sections do not create broken internal links.

## Production verification

The existing Netlify site is `leanodm.netlify.app`, site ID `8482ad26-d838-4a70-bdbd-4f0a3720a70b`, linked to `JayYang267/LEANODM` branch `main`. Its public site API exposes `published_deploy.commit_ref`, deployment state and production URL. Use that record to verify the published commit, independently of GitHub status checks.

The custom domains also have an existing Cloudflare Workers build integration. No Cloudflare configuration change is part of this task. Verify the actual built HTML and assets at Netlify and both custom-domain forms after pushing. Final commit and deployment evidence are reported in the completed chat and retained in the external `.incoming-qa` working directory.
