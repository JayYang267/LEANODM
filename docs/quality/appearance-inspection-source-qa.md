# Appearance inspection primary source audit

Source: `E:/SEO/文章版块/鑫银海产品外观检验标准_英文翻译.docx`

All 189 body blocks, 29 tables, 15 defect categories and 35 embedded PNGs were extracted in order. All 35 originals were visually inspected individually at native size as well as in contact sheets. Every image is referenced once in the body. The only footer part has no text; there are no comments or tracked insertions/deletions. Production changes are limited to the accompanying JSON data, 35 lossless WebP images, and this source QA record.

The workspace dependency loader lists bundled Python and Node runtimes but no bundled LibreOffice path. Desktop LibreOffice was not used. Therefore this is a complete OOXML content and embedded-image review; DOCX page layout and page numbers were not verified by rendering. Body/table locators below refer to `source-ordered.json`, not page numbers.

## Source problem that requires an explicit website treatment

**Category 15 has no valid print-specific acceptance criteria.** The three paragraphs at body/186, body/187 and body/188 exactly repeat deformation paragraphs body/165, body/166 and body/167. The description says “Twisting, inward depression, outward bowing or insufficient flatness”; the next two paragraphs discuss assembly, safety and correction using screws. These are inconsistent with the section title and the three correctly matched printing defect photographs. Do not silently copy these criteria into the printing section. Do not invent print tolerances. An accurate customer-facing treatment is to show the three examples, explain that printing legibility/completeness is reviewed against the agreed artwork and reference sample as a project criterion only if the site owner independently authorizes that policy, and avoid attributing that policy to this source. Without that independent authority, state that print-specific acceptance criteria require confirmation; omit the unrelated deformation copy.

## Inspection and definitions to preserve

- Scope in the source: all company-manufactured products and all externally purchased parts/components. It names Shenzhen Xinyinhai Electronics Co Ltd, Dongguan Branch. The source does not establish a legal relationship to LEANODM; do not invent one or pass its named issuer off as LEANODM certification.
- Critical CR: personal-safety or health risk; examples sharp points/edges, small parts, unsanitary conditions. Major MA: may make product unsalable and likely to cause complaints/returns. Minor MI: minor appearance defects other than CR or MA. These are general definitions, not an exhaustive per-category severity matrix.
- A: surface directly visible under normal use. B: surface not directly visible under normal use. C: internal surface not visible during normal visual observation. Keep those distinctions.
- Normal fluorescent lighting, illuminance **at least 300 lx**.
- View directly from **30 cm**.
- Observe **each surface for 3–5 seconds**.

## Complete category and acceptance audit

| No. | Category and images | Class A | Class B | Class C | Additional requirement |
|---|---|---|---|---|---|
| 1 | Insects, hair and bloodstains; images 1–3 | Not acceptable | Not acceptable | Not acceptable | None |
| 2 | Drag whitening; images 4–5 | Not acceptable | Only spots, haze or faint streaks not visible from **30 cm** acceptable; pronounced streaks visible at **30 cm** rejected | Acceptable | Slight spots/haze may be concealed by spray painting; need not be screened out before painting |
| 3 | Dirt, oil stains and fingerprints; images 6–8 | Accept when area small, easily wiped clean, and not visible from **30 cm**; large/difficult-to-clean/visible-from-**30 cm** area rejected | Small, easily wiped clean and visible only in reflected light acceptable; large/difficult-to-clean area rejected | Acceptable except for customers with special requirements | No numerical area threshold supplied; do not invent one |
| 4 | Flash, sharp points and burrs; images 9–11 | Reject if protruding above surface and felt by hand | Same as A | Accept only if assembly unaffected and no loose foreign material generated | General CR definition remains applicable to safety risks |
| 5 | Surface step mismatch; image 12 | Step **≤ 0.25 mm** and no sharp edge/corner felt by hand | Same as A | Acceptable | Caused by mold-insert/cavity/core mismatch or ultrasonic-welding misalignment |
| 6 | Weld lines; images 13–14 | Acceptable if only visible in reflected light or consistent with customer reference sample | Acceptable | Acceptable | Slight weld lines generally may be concealed by spray painting and need not be screened out |
| 7 | Sink marks; images 15–16 | Acceptable if not visible from **30 cm**; if visible at **30 cm**, reject or assess against customer reference sample | Assess against established acceptance limit or customer reference sample | Acceptable | Slight marks need not be screened before painting/labeling if those operations unaffected; reject marks affecting screen printing, pad printing or label application |
| 8 | Short shots; images 17–19 | Not acceptable | Not acceptable | Assess impact on functionality, strength, assembly or appearance | Do not turn conditional C assessment into unconditional acceptance |
| 9 | Gas marks; image 20 | Assess against customer reference sample | Same as A | Acceptable | Need not be screened out on parts intended for spray painting |
| 10 | Gaps; image 21 | Gap **≤ 0.25 mm** and internal components not visible; designed cosmetic grooves excluded | Same as A | Acceptable | Keep separate from surface step mismatch despite same numerical limit |
| 11 | Scratches and impact damage; images 22–23 | **One** non-tactile scratch: length **≤ 5 mm**, width **≤ 0.1 mm**; **two** such scratches acceptable if **30 mm apart**. Tactile scratch visible from any angle rejected | **One** non-tactile scratch: length **≤ 10 mm**, width **≤ 0.25 mm**; **two** such scratches acceptable if **30 mm apart**. Tactile scratch visible from any angle rejected | Acceptable | Raised/recessed scratches cannot be concealed by painting and must be screened before painting; whitening without raised/recessed profile can be concealed and need not be screened before painting |
| 12 | Off-color specks and color contamination; images 24–26 | **One** speck, diameter **≤ 0.3 mm**; color contamination allowed only if not visible from **30 cm** | **Two** specks, each diameter **< 0.5 mm**, spacing **> 50 mm**; color contamination allowed only if not visible from **30 cm** | Acceptable | Reject transparent parts with these defects; need not screen out on parts intended for painting. Image 24 caption says **≤ 0.3 mm**; image 25 caption says **> 0.5 mm** |
| 13 | Deformation; images 27–29 | No A/B/C matrix: assess overall assembly; reject adverse effect on assembly, functionality or safety | Same overall criterion | Same overall criterion | Slight deformation acceptable if little effect on appearance and correctable by screws |
| 14 | Ejector and pressure whitening; images 30–32 | Acceptable only if not visible from **30 cm** and no obvious surface bulge | Same as A | Acceptable only if no obvious cracks at corners/feature bases and function, strength and assembly unaffected | Before painting, need not screen out only if no obvious bulge and no cracks at corners/feature bases |
| 15 | Blurred or incomplete printed text and graphics; images 33–35 | No reliable print-specific criteria in source | No reliable print-specific criteria in source | No reliable print-specific criteria in source | Source repeats category 13 verbatim; explicitly flag for confirmation |

## Numerical wording and unresolved ambiguities

1. Scratch spacing is literally “spaced **30 mm apart**.” The source does not say **at least 30 mm** or **≥ 30 mm**. Preserve the literal wording; do not silently introduce a minimum-distance inequality.
2. Class B specks use strict **< 0.5 mm** and **> 50 mm**. A uses inclusive **≤ 0.3 mm**. Preserve these different operators.
3. Image 25 illustrates **> 0.5 mm**, while Class B acceptance is **< 0.5 mm**; this does not illustrate the exact **0.5 mm** boundary. The acceptance text itself excludes that equality. Do not change it to ≤ 0.5 mm.
4. Transparency rejection and pre-painting exemption share one additional-requirements paragraph in category 12; their precedence is not explicitly defined for a transparent part that will later be painted. Do not broaden the exemption.
5. Sink-mark A text offers “reject if visible from 30 cm, or assess against customer reference sample.” Preserve the reference-sample alternative; do not present the 30 cm condition as a universal numeric-only rule.
6. Category 4 A/B criteria concern protruding/tactile material, while the general CR definition mentions sharp points and edges as safety risks. A public summary should not imply an internal unsafe sharp point automatically passes simply because Class C allows non-interfering, non-shedding flash.
7. No AQL values, sampling plans, lot acceptance rates, numerical color tolerances, print-gap limits, calibrated measurement method or legal/certification claims are supplied. Do not invent them.
8. Source sections use spaced numbering such as “6 10” and punctuation-light headings. Normalizing to 6.10 or a 01–15 category index improves readability without changing content. All fifteen headings and their photographs are sequential and correctly paired. The only substantive duplicate identified is category 15's body copied from category 13; recurring “Acceptable” and “Not acceptable” cell wording is intentional.
9. “Gas marks” translates the overlaid Chinese 气纹 and is defined only as a local difference in color/luster. Do not substitute burns, bubbles, voids or a more specific mechanism not established by the source. “Weld lines” here means injection-molding knit/melt-joining lines, not metal-welding seams. “Drag whitening” and “ejector/pressure whitening” remain separate defects.

## Embedded image review

Use `images-reviewed.json` for 35 accurate English alt texts and captions, each associated with its source category, relationship ID, table cell and original file. Original circles, ovals, rectangles, arrows and Chinese annotations are already embedded in the PNGs. Do not crop them away, redraw the evidence or add new defect examples. They are small reference images (mostly 468–471 px wide); avoid overstating photographic detail or displaying them as large high-resolution photographs.

The images visually agree with their source category/caption. Native imagery supports the location and appearance of marks; tactile severity, blood identification, assembly impact and dimensions come from source captions, not independent measurement from photographs. In particular, image 3 is visibly a reddish stain labelled by the source as blood, images 22/23 are source-labelled tactile/non-tactile scratches, and images 24/25 include written size labels without a ruler. Alt text distinguishes direct visible description from source claims when needed.

Image 34 contains a printed company name and postal address as part of the smearing example; image 33 contains Japanese label text and image 35 contains a character graphic. These are photographic product examples, not LEANODM customer endorsements or branding claims. Do not promote them as such. All source files remain byte-for-byte preserved under `media/`; image sizes, hashes and relationships are available in the manifests.


## Production verification

Source DOCX SHA256: `4a7495f6c957732f961cd4efb4e52225f34273d7f0ea432fd0eb0e90fe9c38df`. All 35 PNGs were converted with Pillow lossless WebP encoding (`lossless=True`, `exact=True`, `method=6`). Decoded width, height and every RGBA pixel were compared with the corresponding original and matched. No cropping, compositing, annotation replacement or generative editing was used. The JSON contains all 15 categories, 35 correctly ordered image entries and the original supported acceptance text. Category 15 has an empty criteria array and an explicit source issue note.

| Category | Source image / relationship | Production image | Source SHA256 | WebP SHA256 |
|---|---|---|---|---|
| 01 | image1.png / rId10 | /images/quality/appearance-inspection/insect-contamination.webp | `1a5a9a824a577c0734902c525bf52fe9c39a4327ffde0ffd6253343267b5afb0` | `09d382ade46a532258923b9a8a39f96b0772b2ad9f0f8da826483012ec561c38` |
| 01 | image2.png / rId11 | /images/quality/appearance-inspection/hair-contamination.webp | `4aadfca04d3d22c89731d43743cef54fd5857c501551762205924fe061a60fa2` | `fc34a2eb907d724669c5a46a3dc8046ed60b2ef5471e2b6a7ad97742be79d11f` |
| 01 | image3.png / rId12 | /images/quality/appearance-inspection/bloodstain-example.webp | `b852fae75c5102303fa8b2e3185780fbb533a9cc7d782f2de0780f8ec2ad7416` | `c8f1fe2f48b116b83ea8e56b8195af81632a3eb648a900e84f982d4f42ec58a6` |
| 02 | image4.png / rId13 | /images/quality/appearance-inspection/spot-drag-whitening.webp | `70ebf064c0a2a5a560bebb1b4ff29d10d86f65ecae1653bd7c1f23bdd103cca8` | `f23770addfdf091a60b9443122108c72294da624adfd068ccfe1878fc5764903` |
| 02 | image5.png / rId14 | /images/quality/appearance-inspection/spot-haze-drag-whitening.webp | `3dafe50cf8d4d30d3585c27048c192ecf15ba46d39b63a489355d9a266010226` | `c8bcfd2d9911356cbba62022a96589af9a5f56d89c06ead17082ef75405dac44` |
| 03 | image6.png / rId15 | /images/quality/appearance-inspection/dirt-contamination.webp | `922f18f23485b2d5c788763a376fc4eb41cfa1674a5955f9bf17d666f35dbcc1` | `185231e05fa0782aff8260aa75b307c175a9e3951e07e076cce602e1f5d2acd5` |
| 03 | image7.png / rId16 | /images/quality/appearance-inspection/oil-stain.webp | `995279c455a3fd58ce5347d18abbbec5ed030d570491a18a8729fbdc013d4438` | `bc560366a6b04b21b6155863e12af933f3dbc0259599375dc1f98335a3ae087e` |
| 03 | image8.png / rId17 | /images/quality/appearance-inspection/fingerprint.webp | `56e1eb75c423314c934e66bcdcdce47fb56cda7e1bff2f0a1f833573c1f3bac1` | `661bec8ced87252560e3bd791a0ffef3a3fa881fca1b1f0d5a1f40497d3535d6` |
| 04 | image9.png / rId18 | /images/quality/appearance-inspection/flash-excess-material.webp | `9be1211bacc94c01fa7b6311cd86e99383cbe647aa71d4e2d4043260d4ca2147` | `40226c2701bc88ed7d3c95628645f222d7f0c39c8eb039b9ab700c77bb99d832` |
| 04 | image10.png / rId19 | /images/quality/appearance-inspection/sharp-point.webp | `6ef4272b87e4ebb346a3459febd7b2ec99ddac3337cdb00103382ba6af8e4254` | `3f3f3820fbd39fec1763333c09178548df66da5dc33849be5640b5d3797ad29c` |
| 04 | image11.png / rId20 | /images/quality/appearance-inspection/edge-burr.webp | `a951c7c54fb7c7f83bf64dcb2fc366aa14bfc0e42a3bf79c9bae2851564308ac` | `285931617126101ba19eeec81e9dd48f952283c11d3ff72ca76112e188096755` |
| 05 | image12.png / rId21 | /images/quality/appearance-inspection/surface-step-mismatch.webp | `21c8b4160280abe76a38c5b0ad819c65776c29fe9c5bb82b5f7fe128194b7c90` | `a83f65299b6d03041e44362d0e95beb801043c95fda34c608402c6c998b6acbb` |
| 06 | image13.png / rId22 | /images/quality/appearance-inspection/weld-line-class-a.webp | `a2e7bc3d8f14b096582cb8017e5ef0f41e21d0f43518b86921cbdfc907994980` | `5c8bb0f1dbdafa449771bc02d89b407da8dfc2a9e3309b0bdabd4c0199d308c1` |
| 06 | image14.png / rId23 | /images/quality/appearance-inspection/weld-line-class-b.webp | `ce288663b9d3b7bfc9ddbd92ef0e90d4d9305e9467f6c1e14174174dd8f3faa3` | `8053bc4cd00660fa2ce70855709f85a54baf5ca7b069bbee084cc6157eb72c00` |
| 07 | image15.png / rId24 | /images/quality/appearance-inspection/severe-sink-mark.webp | `5a9b881a5e1ec2fba8e512599d2510dd7b7d7c286184ee0f9132b136af2a21ed` | `34686008b50e62ca0d5a861aa88c2d69134c3ddbba91c92d097362442f634d79` |
| 07 | image16.png / rId25 | /images/quality/appearance-inspection/slight-sink-mark.webp | `b3bbe8a5d8c156fb040380fa92b7beb7d092a3fcd967fedbd2d7c22426e26b15` | `aded2684822ee2beae452917cf914825c81b86445aa34ba25c698097b1e2dea9` |
| 08 | image17.png / rId26 | /images/quality/appearance-inspection/short-shot-assembly.webp | `1a1eb2fb81a2971f59cc5ac1b30f480f32b8417c83d8427be41589f612141eb0` | `daa20ab7dcdbcc52da17ef43501c5660b63c10eb78c249f0ee2afef72ef0f90e` |
| 08 | image18.png / rId27 | /images/quality/appearance-inspection/short-shot-appearance.webp | `6b84dc94bcb14cf0d4243b3d94f12c160425d5c6e683e2b43de4a64cebf26766` | `7ab7a5530f76b7b77f870a69dfc71eb16ac8afbbf58de2b0459271155cef0e7b` |
| 08 | image19.png / rId28 | /images/quality/appearance-inspection/short-shot-assembly-safety.webp | `89824d29d4bb2de2dc6017322585b444ad874545ff5c9ab2bd5755491f1b720b` | `5a15da4b08aa217cbbf4bbc17875b01f4ebb7dddeda391442474948d9108b408` |
| 09 | image20.png / rId29 | /images/quality/appearance-inspection/gas-mark.webp | `3c0799b95d5170986f87c880399b9a00fdf327a26c8655b1e05d6562987fea80` | `695a2be143584c743a45276dcbef1c8b8cf72d58cbdd64ffc313650cbbfcfa8e` |
| 10 | image21.png / rId30 | /images/quality/appearance-inspection/assembled-parts-gap.webp | `5c815e66fa04bb5a293b052da99f94168a29fdf80c3cda80a34f2e7a6cf106fc` | `b839315f9831ad757226e95030842491bb7c16e0e3eef597c44302c94ec4b065` |
| 11 | image22.png / rId31 | /images/quality/appearance-inspection/tactile-scratch.webp | `7f3f3dce7f52d5b4fb25d7e543c50aa38df406bca711305f4b5219e2fb2c9723` | `7f80c104eabdedeeb1d883d8eccdb306663b7ad9379e85f7607082a1499a784d` |
| 11 | image23.png / rId32 | /images/quality/appearance-inspection/non-tactile-scratch.webp | `9f3727e0ac9cb5d86e5b71ca0bbe79f15721ab08cb187d2a921abd484659044b` | `e9f6e80227fb7e14eee2a859768c2ec9d6f90947700141e5922044febf377d36` |
| 12 | image24.png / rId33 | /images/quality/appearance-inspection/black-speck-up-to-0-3-mm.webp | `32fce1ee48568ecd03b7235bf964c35b0ed34d3923b9c898e872a1f575a6e182` | `b0b2bda449ebd8c62967a061b531c9cb8f09129c39665283ab90be9dcce7eeac` |
| 12 | image25.png / rId34 | /images/quality/appearance-inspection/black-specks-over-0-5-mm.webp | `34f757b6f35ae6c50a1b62aae8519a61887f4c6bf15e096761088dffa2f571d6` | `60cbdd71a600eaf36360e94dc496e6209155d34589509de21c26f100833a82c4` |
| 12 | image26.png / rId35 | /images/quality/appearance-inspection/color-contamination.webp | `3e26aefdb9231ca62cdcc5e3f7f0fafe187603d1bb7bfe9cec3a9454d7982fcc` | `c1d28b3d543c50a250283430317a6ea5bf22c197b52694834aa1458d6fe46ea4` |
| 13 | image27.png / rId36 | /images/quality/appearance-inspection/deformation-affecting-function.webp | `6233a1e0aefe8868e1fc1b900d1af28efa67fb8ffa1250acd0661108a5be16bc` | `24279291dcf4482a24bb7bc5d4acbeab130998f01d1ff37257ffbc44f8de9332` |
| 13 | image28.png / rId37 | /images/quality/appearance-inspection/severe-deformation.webp | `f838b9af4535edcefb7428c1405314cceb3c88e201b8909bd382a3017bb50275` | `1187b5875e2adb430ae82f6ea404919ba227595e234d8ceae82fb09bfcd876ab` |
| 13 | image29.png / rId38 | /images/quality/appearance-inspection/slight-deformation.webp | `a6259313efe9e6e2e8eac941a9fe143cffcde7fd0666c17e11aeca2ab9f8cafb` | `571309ce32e036698b428a682bacd2eb822888b87c974b82776cd7c254d47fad` |
| 14 | image30.png / rId39 | /images/quality/appearance-inspection/ejector-pin-whitening.webp | `eb076eae07ad0445560b7f6126c992201f302b4aab686a74fb8b7a78ff1dd57b` | `201c57025557ef2a89a7e67cbf6670cc7857894a931695bb9a23ab9acd58df98` |
| 14 | image31.png / rId40 | /images/quality/appearance-inspection/fixture-pressure-whitening.webp | `a1930ec9649906c6c70b5d410ec370e8a5dcabe243ee830fdf96acd705df4ff5` | `e665fd7f1bc51bd1d61502c0686b5df4ef7e8e6a81e6b59fbe220e5fddd930d7` |
| 14 | image32.png / rId41 | /images/quality/appearance-inspection/whitening-feature-base-strength.webp | `80b0d880c2c167c16785da89a515b63fa8a6315c8f5cbd653c31db745cb00330` | `07ac0f9a65a03f20bbdf42d17cd9c461d2ba1044db8bf6b82ebfb324d70ae4e2` |
| 15 | image33.png / rId42 | /images/quality/appearance-inspection/incomplete-printing.webp | `3fbe6a40f4991959596271fe51cd5f9ac108aedf10434afda2d82adbb37f2a74` | `9c38345dd668dff4efb5aaaff31ebfb30053c66d74e1cd999b2258ca8703f574` |
| 15 | image34.png / rId43 | /images/quality/appearance-inspection/ink-smearing.webp | `8fd6d4c4c7e5b72d5c00565e6bf169446e1e48791cad58914998d5641bb03c44` | `57490ed69eb4cf2d5ec9a9c542098292120c63d1dd364b830f5ad5d0a3f745c6` |
| 15 | image35.png / rId44 | /images/quality/appearance-inspection/missing-graphic.webp | `c22406bac10b80db13f60c52c0617e53f66acb274660136276f698375d9366df` | `619ec14e3c8122147fec6feccae55507a779030d619c2f1714fdd7019b8843f3` |
