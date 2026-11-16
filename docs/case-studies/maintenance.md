# Case study catalog maintenance

The Projects section moved to `/case-studies/`. Its first case, the interactive driving sound book, has the stable slug **`interactive-driving-sound-book`**. The former directory and detail paths under `/projects/` redirect permanently to their corresponding Case Studies pages.

Add one `src/content/case-studies/<slug>.json` file and its reviewed media. Astro uses that one entry to generate the catalog card, category filter, detail page, related cards and, for published cases, the sitemap entry. Keep the filename and slug identical and stable even if the title, category or display order changes. If an already public route must change, register its permanent redirect in both `astro.config.mjs` and `public/_redirects`.

- **Required:** `slug` (lowercase words separated by hyphens), `title` (short product name for cards), `category` (actual product category; reuse the existing spelling), `summary`, `cover` with `src` and meaningful `alt`, and `overview` with nonempty `paragraphs` and `responsibilities` arrays.
- **Optional:** `heading` for a natural H1 incorporating the product category, `facts` with `label` and `value`, extra `gallery` photos, `process` steps, `quality` observations, and numeric `order` (ascending, then title). Process steps take `title` and `description`; quality observations take `title`, `issue`, `action` and an optional evidenced `result`. Empty sections and missing results do not render.
- **Visibility:** use `published` (the default) once the case copy and each media item are cleared for public use. Keep unapproved copy in the ignored `.case-study-preview/<slug>.json` directory with `visibility: "local"`, and keep private media outside the repository. Ordinary dev and production builds do not load that directory. The published sound book entry uses the reviewed files from production commit `7791ffe`. For each new case, place the approved copy in `src/content/case-studies/`, use reviewed public media URLs, mark the entry published, and preserve any previous public detail URL through a permanent redirect.

Use actual product photos with no unrelated placeholder images. For approved assets, use a stable root-relative path or an approved HTTPS host. Prefer optimized WebP/JPEG photos, with a descriptive alt and a short caption when it adds context. The catalog frame is near square; choose `fit: "contain"` for products that cannot be cropped, or set an image `position` such as `"50% 35%"` to keep the subject in view. Use a different view for gallery thumbnails. Put process imagery, MP4 with English WebVTT captions and optional poster, or a relevant file/link on the step it actually documents. Use an English `caption` on video. Do not publish client names, logos, internal files or production results unless their release is documented. Separate visible checks from measured outcomes; omit claims the case records do not support.

The collection schema is `src/content.config.ts`. The catalog route is `src/pages/case-studies/index.astro`, the dynamic route is `src/pages/case-studies/[slug].astro`, and the shared product detail is `src/layouts/CaseStudyLayout.astro`. Change the shared layout, `src/components/case-studies/`, or `src/styles/case-studies.css` when case pages need a style change. Keep the detail order: product photo and project facts, overview and our role, manufacturing and challenges, checks and improvements, related cases and inquiry.

Use ordinary `npm run dev` (port 4321) to review public content. For the fixed template with protected media, set `LEANODM_CASE_PREVIEW_DIR` to the absolute **private** edit directory in the current shell and run:

```powershell
$env:LEANODM_CASE_PREVIEW_DIR = 'C:/absolute/path/to/private-case-edit'
npm run dev -- --config astro.case-preview.config.mjs
```

Visit `http://127.0.0.1:4362/case-studies/` and `http://127.0.0.1:4362/case-studies/interactive-driving-sound-book/`. Check the grid at desktop, tablet and phone widths, keyboard filter controls, photo/title links, image crop, heading order, optional sections, native video playback/captions and the RFQ/visit links. The protected preview adds noindex and no-store headers and only serves on loopback.

```powershell
npm run build
node --test scripts/test-seo.mjs scripts/test-products-removal.mjs
node scripts/verify-site-identity.mjs
node scripts/verify-navigation.mjs
```

The public build must include only authorized cases, use the confirmed canonical origin, and omit the private template entry, its media and legacy detail alias. An empty public directory can still link to the site's inquiry page.
