# Concept demo video quality gate — 2026-10-26

## Current release rule

This is a chronological record. Counts and acceptance statements in earlier sections describe their recorded snapshot, not the current release. The live film list is the explicit `src/data/products/concept-demo-3d-ready.json` allowlist. The user subsequently authorized normal publication to leanodm.com and continued production of all seventeen native replacements.

Every new registration requires an independent review of the actual encoded MP4, bound to its SHA256 and render revision. Production must include a complete per-frame bake comparison and the true six-plane render-triangle hand/cuff visibility gate. Review includes exact adjacent encoded frames at every actor visibility switch, intermediate approach and retreat, product framing throughout the film, contact and functional response, English captions, and the actual decoded AAC. A source preflight, sparse contact sheet or zero-inside-vertices result alone cannot grant a film PASS. Native shell contact investigations use triangle intersections and closed-volume tests, including face-interior samples where needed.

The initial PathShift and PictureHarbor clips were later found to contain abrupt hand appearances at visibility switches that earlier wide time samples missed. Their old PASS evidence and original reviewed clips were archived; both formal gates were changed to BLOCKED. Commit `32fd52bfd91965d0b4b37808ee7acb44789f9727` withdrew both ready records and all six public media assets. Live checks confirmed both detail pages used their covers without VideoObject markup and the six withdrawn assets returned 404. A repaired source is not permission to restore an old clip: a new actual encoded movie needs a fresh SHA-bound final PASS.

See [the native film pipeline](native-concept-film-pipeline.md) for source, private input requirements and the review-to-release procedure. Historical work and QA files named below are private evidence paths, not files required for the website build.

## Rejected batch and containment

The previous batch of 17 concept demo videos is rejected. Its static product images, two-dimensional diagrams and explanatory text do not provide the requested product interaction and three-dimensional animation. That batch must not serve as the final product demonstration.

The rejected videos are hidden from every concept detail hero. Their generated files remain on disk for traceability. The existing optimized product cover is the current hero, and the native original rendering gallery remains available.

`src/data/products/concept-demo-3d-ready.json` is an explicit allowlist. Say Island is the first completed and user-approved record. `ConceptDetail.astro` shows video controls, video links and video structured data only when the current product slug is in this allowlist. Without a completed replacement, the page uses the actual 800 × 800 cover for its primary-image structured data and emits no VideoObject or video reference. Adding an existing rejected file to the allowlist is not a remedy.

## Required replacement behavior

Every replacement must demonstrate the actual proposed product through its own geometry and interaction, rather than using a diagram or captions as a substitute for action.

- Preserve the product's design, proportions, colors, controls, markings and proposed function. Do not add capabilities or accessories.
- Make the physical input action legible: the viewer can see which control or product part is touched, moved, turned, inserted or otherwise operated.
- Show an immediate response that accurately follows that input and the documented concept behavior. Do not invent an electronic, mechanical, audio or screen response merely to make the animation more active.
- Maintain camera and scene continuity so the same product, control and action remain understandable across the interaction. A camera move must not conceal the action or substitute for it.
- Use minimal English text. Let the product action and response carry the explanation; any English caption should be short and support the visible action.
- Keep the digital-concept disclosure accurate. An animation is not evidence of a physical prototype, tested behavior or production readiness.

## Say Island must pass first

The first replacement sample is Say Island. It passed the independent clip/contact gates below and the user explicitly accepted its direction with “方向符合，继续逐款制作”. That approval authorizes production of the remaining sixteen; another style-approval request is unnecessary.

The independent review must inspect the finished clip, not just a storyboard or render plan, and record evidence for all of the following:

| Check | Passing evidence |
| --- | --- |
| Product fidelity | The visible geometry, controls, markings, proportions and colors match the source concept. |
| Physical input | The viewer can identify the operated part and follow the input action directly on the product. |
| Accurate response | The immediate result follows the input and remains within the documented proposed function. |
| Continuity | Product identity, camera orientation and interaction remain legible across the action and response. |
| Text restraint | English text is brief; product interaction supplies the explanation. |
| Truthful presentation | The clip remains clearly a digital concept animation and makes no physical-prototype or validated-performance claim. |

A failed check requires a targeted repair and a fresh independent review. Record the finished sample and its independent review before adding its typed asset record to `concept-demo-3d-ready.json`. A record contains the slug, actual duration, video dimensions, poster dimensions and creation timestamp. Expand to the other products only after that sample passes; every completed replacement must meet the same checks before its record is added. Internal QA readiness does not mean that the user has accepted the visual direction.

All work remains local under the publication hold in `AGENTS.md`. This quality gate does not authorize a deployment, publication, push or release.

## Containment verification

`npm run build` completed successfully on 2026-10-26 and produced 146 pages. Inspection of the generated HTML found 17 concept detail pages: all 17 use the cover hero and retain the original gallery, and none contains a video element or VideoObject. The build reported Vite plugin deprecation warnings concerning esbuild options; no build errors occurred.

## Native replacement source and repair evidence

The replacement Say Island scene imports the original `SSDAO-ID-R01 / B_DESKTOP_OFFLINE_AA` meshes, control markings and CMF. `B_mesh.json`, `B_KEY_RIGHT_DEPRESSED_mesh.json` and `design_parameters.json` are copied read-only from the originating product-design workspace into `work/concept-demos-3d/say-island/source/`. The source's 0.8 mm button state remains an unvalidated illustration, not a verified stroke specification. The screen pictogram keeps the original front-face silhouette and is flattened onto the display plane so its CAD illustration solids do not resemble physical raised artwork.

The scene uses Blender 4.5.3 LTS, native 1920 × 1080 frames, 24 fps, Cycles and OptiX. The skinned pointing hand comes from the pinned WebXR input-profiles assets package; its source/license notice is kept in `work/concept-demos-3d/ASSET-NOTICES.md`. The actual animation source is `scripts/render-say-island-3d.py`, with an editable `.blend` scene in the work folder. The original product geometry is never replaced with a photograph on a plane.

The first hand pose interpreted the palm axes incorrectly; the corrected right-hand rig uses the YZ palm plane, X normal and positive Y finger curls. A later exact contact check found that nearest-face distance understated a real 2.352 mm top-plane intersection. The contact translation was repaired, and all affected frames were archived and re-rendered. Three independent ray-parity directions now find zero index-pad vertices inside either closed key mesh; nearest gaps at the two checked press states are approximately 0.058 mm. Checks of all three press poses found no true hand–shell intersections or table penetration. These are digital scene checks only. The detailed evidence and superseded results are in `work/concept-demos-3d/say-island/frame-gate.json`.

All 51 media files from the rejected 2D batch have been moved out of the public website into `work/concept-demos-3d/rejected-2d-2026-10-26/`. Their scripts and source assets are retained for traceability, not for delivery. The rejected internal contact preview is also kept outside the public website.

The other 16 selected original STEP assemblies have been exported read-only into `work/concept-demos-3d/native-portfolio/` with source names, colors, source-declared transparency and action metadata. The manifest covers 337 parts and 896,238 triangles; original hashes are unchanged. Per-product, source-cited 3D storyboards are in `work/concept-demos-3d/native-storyboards.json`. These preparations are not completed videos and do not make those products eligible for the video gate.

## First local review sample

Say Island's completed replacement passed the independent still/contact and encoded-clip gates. The 30-second MP4 contains 720 native 1920 × 1080 frames at 24 fps, is 7,334,038 bytes, and decodes completely without errors. The three manual presses precede their picture changes; visible hand entry and exit remain continuous. A small persistent `Illustrative 3D concept` label identifies the footage as an animation. Ten brief English caption cues accompany the actions; the audio contains quiet mechanical Foley only. No narrated text panels, speech recognition or automatic judging are shown.

The final evidence is in `work/concept-demos-3d/say-island/render-report.json`, `frame-gate.json` and `full-clip-gate.json`. Only Say Island's typed asset record was added to `concept-demo-3d-ready.json`. Its MP4, captions and 1280 × 720 poster are under `public/media/concept-demos/3d/`.

Browser checks confirmed 30-second 1080p playback with no media error and the English caption track loaded and showing. The tested 1280-pixel desktop and 319-pixel narrow layouts have no horizontal overflow. Keyboard seeking works through the native progress control; playback remains user initiated. Review screenshots are `.impeccable/review/say-island-3d-desktop-20261026.jpg` and `say-island-3d-mobile-20261026.jpg`.

The final production build passed with 146 pages and only the existing Vite deprecation warnings. Generated HTML contains 17 concept detail pages, one video element and one VideoObject; the other 16 pages keep optimized cover heroes, and all 17 retain their original galleries. Schema uses the actual 30-second duration, 1920 × 1080 video dimensions, 1280 × 720 poster dimensions and asset creation timestamp.

The user accepted the first replacement's direction and authorized the remaining sixteen. Their individual native scenes and English audio/caption tracks are now in production. Draft previews exposed cuff-end occlusion in several scenes; those poses are being corrected before final rendering. ListenNest passed its repaired-control clearance check and entered full native production. No additional film is eligible for the website until its finished-clip review passes. No deployment, push or external publication was performed.

## First production publication

On 2026-10-26 the user explicitly instructed publication to leanodm.com, then requested the already completed work be published first while all remaining work continues. That instruction satisfies the existing publication hold's explicit-authorization condition.

The first production snapshot was committed as `7cb5c900fe6205c12b8b20aa4e49fe147d09b2b3`, based on existing production `7a08ea22dfe73b255c3857a3f750efc18c23c37c`, in an isolated release checkout. It contains the current website and two accepted native films: Say Island and PathShift. The original working checkout and its unfinished production assets were preserved. The snapshot built 150 pages. An additional artifact check examined 17,808 local page/resource references and found none missing. Four older checker scripts failed against changed contracts or direct-Node TypeScript loading; their results are not presented as passing checks.

The commit was pushed normally to GitHub main and deployed by the existing Cloudflare Workers Builds connection (build `1f446767-0013-4513-99b8-1c1615035d46`). The home, products and Say Island detail URLs returned HTTP 200 on leanodm.com. Both MP4s and both posters returned HTTP 200 and matched the local publication bytes by SHA256. English captions matched after Git's CRLF/LF normalization and were served as text/vtt. Browser playback confirmed 1920×1080, 30 seconds, no media error, loaded English captions (track state 2), and no horizontal overflow. The public browser screenshot is `.impeccable/review/production-say-island-20261026.jpg`.

Pattern Pebble subsequently passed finished-clip review and was registered locally. Fourteen further films remain in production; none is made eligible merely because it has rendered. A shared sleeve defect found in final Picture Harbor review was repaired against evaluated skin geometry; 58 poses across 16 scenes passed the revised sleeve checks before the production queue resumed.
