# LEANODM website content rules

Publication hold (user instruction, 2026-10-24): Keep recent and ongoing changes in local editing and preview. Do not deploy, publish, or trigger a release workflow, including through a push, without the user's explicit instruction to publish. Local builds and localhost previews are allowed.

## Permanent single-source rule

The user established this rule on 2026-11-16. `E:/WEB/LEANODM` is the only editable LEANODM website checkout. Use it for all website changes, local previews, integration, and release preparation. Historical worktrees, exports, and builds are records. Do not start website work from them, edit them as alternative versions, or deploy their contents.

`origin/main` is the production history for the same site. Before an authorized production release, reconcile its current head and every in-scope user change in the canonical checkout. Preserve existing published features and the approval scope for local drafts and private assets. Build and validate the exact release commit from the canonical checkout. Use one production release at a time and record its Git commit and deployment ID. After deployment, verify those identifiers and the affected routes, links, and functionality on the public domain.

Read [docs/site-identity.md](docs/site-identity.md) before editing public content, metadata, schema, translations or future design specifications. It supersedes conflicting identity statements in older project documents.

LEANODM / LEANODM.com is the website name. It presents Xinyinhai's product development and manufacturing capabilities and supports project discussions. Do not invent brand, company, ownership, employment, agency or legal relationships. Attribute factory history, facilities, equipment, employee policies and certifications to their documented Xinyinhai subject. Project communication may naturally use we / our team.

Keep source documents unchanged and preserve existing confidentiality, historical-evidence and publication boundaries. Do not infer registered addresses, current certification validity, contractual parties, payment recipients or privacy responsibility from marketing copy. Record unresolved facts for confirmation.

The Products catalog was retired on 2026-11-16. Historical Products documents are reference material. The Case Studies section occupies the former Products position in desktop and mobile navigation.

Each navigation label and its accompanying arrow must share one hover, focus and click target, while every existing destination URL remains reachable.

For the case directory at `/case-studies/`, follow [the case study maintenance rules](docs/case-studies/maintenance.md). The fixed template case is `interactive-driving-sound-book`, regardless of card order. Add one validated entry to `src/content/case-studies/` and provide its reviewed media; the catalog card and detail route are generated from that entry. Apply sitewide case style changes in `src/layouts/CaseStudyLayout.astro`, `src/components/case-studies/`, and `src/styles/case-studies.css`. Keep unapproved entries in the ignored `.case-study-preview/` directory and their media outside the repository, available only in protected localhost preview.
