# Native concept film pipeline

The website and native-film production are separate builds. `npm ci` and `npm run build` build the Astro website from checked-in content and approved public assets. Blender, private CAD and production work folders are not website dependencies.

The committed Python and JavaScript scripts preserve the final native scene, animation, audio, encoding and registration logic. The tested production toolchain was Windows, Python 3.11.17, Blender `bpy` 4.5.3 LTS, NumPy 1.26.4, Node.js 24.15.0, Sharp 0.34.5 and FFmpeg 7.1. Install `bpy` and NumPy into a dedicated Python environment, and use the repository's npm lockfile for JavaScript dependencies. Set `FFMPEG_PATH` to the local FFmpeg executable when encoding or reviewing. English synthetic product prompts use the verified Microsoft Zira Desktop SAPI voice through `render-native-speech.ps1`; they are proposed concept sounds, not recordings of physical products.

## Private input pack

Production commands run from the repository root. The original CAD, exported native meshes, licensed source assets, caches, rendered frames and QA reports stay in `work/concept-demos-3d/`; they are intentionally excluded from the website release.

| Input | Required location and meaning |
| --- | --- |
| Sixteen selected native assemblies | `native-portfolio/<slug>/mesh.json`, `metadata.json`, `action-state.json`, relative to the work folder. Part records retain source names, vertices `v`, triangle indices `t`, color and declared opacity. Coordinates and original motion metadata use millimetres. |
| Say Island native geometry | `say-island/source/B_mesh.json`, `B_KEY_RIGHT_DEPRESSED_mesh.json` and original design parameters. Its separately approved renderer preserves the original two-key product. |
| Articulated right hand | `node_modules/@webxr-input-profiles/assets/dist/profiles/generic-hand/right.glb` in the work folder. The loader pins package 1.0.20 and SHA256 `291790c14f7f88a7f9bd35330c47392ed8e8d395ae6728f4bb7089f1bc1f2b96`. MIT attribution and license text are retained in the hand source. |
| Neutral head context, where used | `three-source/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb` in the work folder. Modified Infinite 3D Head Scan by Lee Perry-Smith, CC BY 3.0; the public film credits record the source and modifications. |

`concept_3d/native_scene.py` loads native product geometry without redesigning it, preserves part provenance and CMF, converts millimetres to metres, and applies documented source motion. Scene modules specify the proposed use, concise English captions and sound events. Any preview on a proposed display is explicitly illustrative. Screen-free PocketArc has no display or wireless action; ReadLoop is a passive acoustic guide; Say Island uses human judging rather than automatic recognition.

Exact reproduction of an earlier delivered film also needs its SHA-bound source snapshot, original input pack, asset hashes, toolchain, settings and reports. Current scene sources can contain a later documented repair. Do not replace an accepted public movie merely because the current renderer is newer.

The accepted PictureHarbor and TimePebble revisions have a known stage-registry limitation: their custom friction-turn hand was absent from the built-in pointer selection for the visibility report. Each finished clip therefore also underwent a complete independent scan of every evaluated skin/cuff mesh at the same baked revision, followed by inspection of every corresponding adjacent encoded frame (12 PictureHarbor and 16 TimePebble records, all zero intersecting triangles). Their partial built-in counts are not described as full actor coverage. The renderer owner's registry patch remains unapplied to the accepted production source; future runs must explicitly include every custom actor in preflight and independent final review.

## Production and review

Use the environment's Python executable for the commands below. Replace `<slug>` with one explicit concept slug. These commands create private work outputs, except the encoder's MP4/VTT/poster and the registration step's ready JSON.

1. Prepare scene-defined audio and captions: `python scripts/prepare-concept-audio.py --slug <slug>`. The generated provenance records synthetic speech, tones and Foley with their event times. Audio mixing uses promoted arithmetic and complete speech-tail envelopes.
2. Run CPU preflight: `python scripts/render-native-concept.py --slug <slug> --bake-check --cpu`. The renderer first samples the entire procedural timeline, then writes animation keys. Its full-frame gate compares editable-scene results against those samples, including world matrices, bones, camera, render visibility, shader sockets, material assignment and light energy. Its visibility gate clips evaluated skin and cuff render triangles against all six camera planes at every first/last visible actor frame; blocking intersections prevent production rendering.
3. Independently inspect native contact and travel paths, complete product framing, useful camera views, visible approach/retreat and same-frame actor-on/off shadows. Check skin and cuff against native closed solids and the table. A zero vertex count can miss triangle-interior penetration. Inspect actual CPU images in addition to numeric results; keep the source hashes and evidence.
4. Render native production frames: `python scripts/render-native-concept.py --slug <slug> --animate`. Use one GPU render process at a time. `run-native-film-batch.py` serializes a queue and can wait for an existing process. Frame-cache export and verification scripts preserve exact original-frame state; they do not interpolate replacement frames.
5. Encode: `node scripts/encode-native-concept.mjs --slug <slug>`. The encoder uses the native frame sequence and matching audio/captions, creates H.264 1080p/24 fps video with AAC, validates decoding and writes an asset/revision report. Say Island has its own renderer and `encode-say-island-3d.mjs`.
6. Prepare evidence from the actual MP4: `node scripts/review-native-film.mjs --slug <slug>` and `node scripts/review-native-film-audio.mjs --slug <slug>`. Review extraction includes exact adjacent frames at every visibility switch, plus functional/cue samples. Check the complete action and camera sequence, all native product parts, captions, synthetic response timing and actual AAC. These scripts never issue a visual PASS.
7. An independent reviewer records `films/<slug>/final-gate.json` with `status: "PASS"`, exact `videoSha256`, render `revision` and evidence only after the finished clip passes. Preserve superseded findings; a failure remains BLOCKED until a repaired actual clip is reviewed. No watcher or publisher may synthesize this decision.
8. Register only the approved actual assets: `node scripts/register-native-demo.mjs --slugs <slug>`. Registration checks the independent gate against the real video, encoded and production revision, full native frame count, bake and visibility gates, and all asset hashes. It then updates `src/data/products/concept-demo-3d-ready.json`.

The render report, editable `.blend`, source hashes and scene/input provenance remain beside the private frame sequence. Preserve them rather than silently overwriting evidence for a rejected production revision.

## Website release

The ready JSON is the only film allowlist. Without a ready record, a concept page uses its optimized cover and emits no video or VideoObject. A ready record contains actual duration/dimensions and optional credits link; it is not a claim of tested hardware or manufacturing readiness.

Copy only approved MP4, VTT, poster, any required public credits, the ready JSON and explicitly reviewed source/documentation paths into the isolated release checkout. Do not stage `work/`, CAD, temporary QA, `.env` or unrelated dirty files. Build and inspect all seventeen concept pages: ready pages must each have one video and one VideoObject, while other pages retain their covers.

Commit and push normally; stop on build failure, conflicting release changes or a non-fast-forward push. After deployment, independently request the live HTML and media. Compare real MP4/poster SHA256, normalized VTT text and required credits; verify playback and English tracks in a browser. A successful push alone is not proof of a live release. Revoking a film requires removing its ready record and public assets, rebuilding and confirming the live cover/no-VideoObject state and asset 404s. A BLOCKED gate must never be restored automatically.
