# Incoming inspection source QA

The incoming inspection content is based on the supplied Chinese document `IQC外来物料检验标准.doc`. Its parameters and defect marks are transcribed with attribution. Unresolved source inconsistencies are retained and explained; the page does not turn them into new acceptance rules.

## Source identity and extraction

| Field | Verified value |
| --- | --- |
| Original source | `E:/鑫银海原始资料/IQC外来物料检验标准.doc` |
| SHA-256 | `79d6c7f041460221527d1e27a1fce9144cd2a065bf59a49dc55113ccafb01f8b` |
| Original format | Legacy OLE binary Word document |
| Document number | `TV-QM-S001` |
| Organization | 鑫银海电子有限公司 |
| Effective date printed in source | `2021/08/13` |
| Preparation date printed in source | `2021.8.8` |
| Revision/version field | No specific version value shown |
| Rendered pages | 7 |
| Material categories | 20 |
| Inspection criteria | 199 |

The source was opened read-only through `Word.Application` compatibility COM with macros disabled. The installed process was WPS, although the COM application reports Microsoft Word 12.0. A separate OOXML copy was saved with format 12, then parsed for table cells and actual `gridSpan`/`vMerge` relationships. The PDF was exported through that same compatibility interface. The original source hash was checked before and after conversion and was unchanged. The source was not saved or edited.

All seven rendered pages were visually inspected against the extracted text and defect-mark columns. Page references in this audit refer to that exported PDF; another renderer can paginate a legacy Word file differently. This audit does not establish that the 2021 document is the latest company revision or that it is an external certification.

Working evidence is retained in `C:/Users/Defineless/Documents/ChatGPT/网站搭建/.incoming-source-review/`:

- `source.txt`: original Word `Content.Text`, including cell delimiters.
- `source-complete-rendered-text.txt`: full PDF-extracted text with page boundaries, headers and footers.
- `source-structure.json`: original cells, grid positions, vertical/horizontal merges, cell origins and normalized criteria.
- `inspection-rows.json` and `inspection-rows.md`: all 199 rows, methods, severity marks and source references.
- `numeric-criteria.json`: 43 rows containing quantities, thresholds, counts, time periods or grades, excluding mere item numbering.
- `source-converted.docx`, `original-word-render.pdf`, `page-01.png` through `page-07.png`.
- `source-audit.md`: expanded Chinese source audit and full quantitative-row inventory.

References such as `T5R33` mean table 5, row 33 in the OOXML body. Table 1 contains the general provisions. The PDF visibly numbers the exemption paragraph **7**; Word `Content.Text` omits that automatic list number. The extraction therefore must not describe section 7 as missing.

Some category cells in the final source table are separate blank cells, not merged cells. Their category is inferred from the preceding named material only for navigation. The raw blank value and an explicit context-inference flag are retained in the extraction. Blank inspection methods are not automatically filled from preceding rows.

## Confirmed general provisions

- Scope: incoming materials, including semi-finished and finished goods.
- References: product quality standards, customer standards, and Engineering or QA samples.
- Sampling: **MIL-STD-105E, single normal sampling, General Inspection Level II**. The source does not provide lot-size/sample-size or Ac/Re lookup tables.
- Acceptance quality levels: **CR 0, MAJ 0.65, MIN 2.5**. These exact values must be preserved. They are not rewritten as a universal percentage of defects permitted in every lot.
- Special customer requirements, or stricter customer requirements, take precedence.
- Viewing conditions: 25–30 cm, 45-degree angle, 5 seconds. Inspector unaided vision: 0.7 or above.
- Lighting: 40 W white light, 1.5–2 m from the inspected surface, directed perpendicular to it. The lamp-count wording is `2一支或以上`; the exact intended count is ambiguous and should not be silently repaired.
- CR: hazardous electrical, mechanical or appearance defects. MAJ: functional/structural defects or appearance problems visible at 50 cm or farther. MIN: appearance defects visible under the stated 25–30 cm, 45-degree, 5-second conditions, excluding appearance CR defects.

The 199 rows contain 150 MAJ-only marks, 38 MIN-only marks, 8 CR-only marks, 2 CR/MAJ double marks and 1 unmarked severity row.

## Unresolved source issues

| Source location | Issue | Required treatment |
| --- | --- | --- |
| Page 1 §7 versus T5R35–38 and T5R41, pages 6–7 | The general provision temporarily exempts 胶料, 色粉 and 线 because the factory cannot test them. Later rows specify wire/contact checks and a CR-marked color-powder/material appearance, batch and report-age check. “线” may mean wire or another thread/line material. | Describe the conflict and seek QA applicability confirmation. Neither blanket routine testing nor blanket exemption is established. A report check is not a claim of in-house chemical testing. |
| T2R11 and T2R31, page 2 | Outer-carton joint strength and inner-carton joint connection each have both CR and MAJ stars. | Preserve both marks with a source-ambiguity note. Do not select one arbitrarily. |
| T3R39, page 3 | Plastic-bag marking in the wrong importing-country language has no CR/MAJ/MIN star. | Display “Not marked”; method remains visual/sample comparison. |
| T5R23–26, page 6 | Two shallow scratches longer than 3 mm are MIN, but at least two shorter than 3 mm are MAJ. At least one deep scratch longer than 1 mm is MIN, but more than one shorter than 1 mm is MAJ. | Preserve and qualify the inconsistent order. Do not reverse the stars or treat the MIN rows as acceptance permission. |
| T5R12, page 6 | Blocked/misaligned/stripped screw holes affecting assembly are MIN despite the general MAJ functional/structural definition. | Flag the classification conflict. |
| T3R70, page 4 | A key-ring sharp edge/corner that scratches the hand is MAJ, whereas some blister/spring sharp-feature rows are CR. | Retain the source mark and qualify it; do not use it to downgrade an actual safety defect. |
| T5R40, page 7 | Cable-tie color and the ability to lock completely share a MIN mark. A locking failure may conflict with the general MAJ functional definition. | Preserve the grouped source row and request classification confirmation. |
| T2R14 versus T2R33, page 2 | Blurred but distinguishable outer-carton printing is MAJ; the analogous inner-carton row is MIN. | Keep the difference rather than harmonizing the two marks. |
| T5R15–17, page 6 | Plating loss above and below 1 mm² is MAJ. A below-1 mm² row specifies at least 3 spots, while another has no count. | Do not infer an allowed count. Exactly 1 mm² is not explicitly classified by these inequalities. |
| T3R19, page 3 | Color-box surface damage above 6.4 × 6.4 mm has blank item-name and method cells. | “Damage” may be identified as context, but the method remains unspecified. |
| T3R33–34, page 3; T4R27–32, page 5 | Plastic-bag material/color and six manual trimming/appearance/binding/packaging rows have blank inspection methods. | Display “Not specified in source.” Nine rows in total lack a method, including T3R19. |
| T5R46, page 7 | Fabric seam pull-test preparation specifies 10–12 stitches/inch, 4 mm seam allowance, 5 seconds to apply load and a 10-second hold, but no target or pass/fail force. | These are partial preparation/timing conditions, not an executable complete pull-test specification. |
| T5R33, page 6 | PCBA functions and operating/standby/power-off currents are listed with a CR mark, but no numerical current limits or product test instruction is supplied. | Retain the CR source attribution without inventing current limits or asserting that every functional deviation is hazardous. |
| T3R75, page 4 | The source writes 盐物 and references an absent test instruction. | “Salt spray” is a disclosed interpretation of a likely typo. Do not invent solution, duration, temperature or pass/fail requirements. |
| T5R45, page 7 | Dry and wet rubbing are both required to be grade 4 or above, but no test-method standard or grading scale is named. | Preserve ≥ grade 4 without adding an ISO/AATCC method. |
| T5R34 and T5R38, pages 6–7 | Solderability specifies a 60 W iron and complete wetting in 2 seconds. | Do not add temperature, solder alloy or flux requirements. |
| T5R51, page 7 | PVC ball weight says “exceeds 2%” without a nominal weight, direction or calculation basis. | Retain the unresolved phrase; do not convert it to ±2%. |

Several strict inequalities leave equality cases undefined: inner-carton MIN dimensional ranges; color-box, header-card/tag and bag damage sizes; hardware plating at exactly 1 mm²; and scratches at exactly 1 or 3 mm. Area and length tests connected by “or” can also overlap across severity rows when the two dimensions fall into different classes. No missing boundary or priority rule is invented.

Other literal ambiguities include blister `穿孔直径D>1×1mm` (diameter expressed with a two-dimensional size), inconsistent H/h notation, and source typos such as 吸索/吸嗦, 电络铁 and 横树纹. Regional spring terminology 耳度 is explained as the spring end geometry. 胶料 does not unambiguously identify a specific resin chemistry.

Positive requirements are labeled as requirements so that “fits properly,” “no stains,” or “meets dimensions” is not presented as a defect. A severity star belongs to the inspection item/nonconformance, not to successful compliance.

Chinese 以上 is rendered inclusively where applicable: the sewn-part seam allowance is at least 5 mm, and the PVC air-retention observation is at least 8 hours. The 4 mm allowance in T5R46 is pull-test specimen preparation; it is a different application from the 5 mm sewn incoming-part requirement in T5R49.

## Category and page coverage

| Category | Criteria | Rendered pages |
| --- | ---: | --- |
| Outer cartons | 21 | 2 |
| Inner cartons | 20 | 2–3 |
| Color boxes | 17 | 3 |
| Header cards/tags | 9 | 3 |
| Plastic bags | 13 | 3 |
| Blister cards/covers | 11 | 4 |
| Springs | 8 | 4 |
| Key rings | 9 | 4 |
| Screws/nuts | 15 | 4–5 |
| Magnets | 11 | 5 |
| Instruction manuals | 14 | 5 |
| General hardware | 25 | 6 |
| Stickers | 4 | 6 |
| PCBA | 4 | 6 |
| Wires and plug/contact pieces | 4 | 6–7 |
| Cable ties | 2 | 7 |
| 胶料 and color powder | 1 | 7 |
| Fabrics | 5 | 7 |
| Sewn semi-finished parts | 3 | 7 |
| PVC balls | 3 | 7 |

## Rendered evidence provenance

Page PNGs were rendered with bundled Python `pypdfium2` at scale 1.75. Crops were rendered directly from the exported PDF at scale 2.5. No source text, table lines or stars were replaced, redrawn or moved.

Coordinates below are PDF points, expressed as a rectangle `(left, top, right, bottom)` from the page's top-left. The renderer receives the equivalent margins `(left, pageHeight − bottom, pageWidth − right, top)`. This transformation is documented in `structure_and_render.py` in the working evidence directory.

| Evidence file | Page | Rectangle in PDF points | Content |
| --- | ---: | --- | --- |
| `evidence-sampling-and-exemption.png` | 1 | `(40, 282, 560, 683)` | Viewing/lighting, sampling, exact AQL values, classification definitions and exemption statement |
| `evidence-electronics.png` | 6 | `(40, 672, 560, 762)` | PCBA dimensions, appearance, function/current and solderability rows |
| `evidence-materials-and-fabric.png` | 7 | `(40, 190, 560, 416)` | Color powder/material report checks, fabrics, sewn parts and PVC balls |
| `evidence-bag-critical.png` | 3 | `(40, 590, 560, 695)` | Bag critical thresholds and language row with no severity mark |
| `evidence-hardware-severity.png` | 6 | `(40, 541, 560, 617)` | The original inconsistent hardware scratch marks |

The cropped table excerpts do not repeat the column header. Their three severity columns run left to right **CR, MAJ, MIN**; complete headers are visible in the full-page evidence. Captions or adjacent explanatory content should preserve that context. The crops show original rows and can include a small portion of a neighboring row at an edge.

## Translation review

The 14 non-packaging material groups in the data-building script were checked against the extracted original rows, including severity positions and actual merged method cells. The inclusive 5 mm and 8-hour translations are correct. The source's uncertain salt-spray term, regional spring term, wire applicability, PCBA test-row classification, missing force and PVC 2% conditions are explicitly qualified. The method mapping distinguishes visual comparison, sample comparison, trial fit/use, wiping, caliper/ruler measurement, scale, rubbing tester, force gauge and soldering iron.

Two wording improvements were applied: 浑浊 is translated as cloudy without adding an independent impurity claim, and generic 胶料 is called molding materials rather than a specific resin. The material-exemption FAQ and evidence alternative text use the same terminology. Captions for both table excerpts now state the CR, MAJ, MIN column order because the cropped images omit the table header.

The final `src/data/incoming-standard.json` was independently checked against `inspection-rows.json`: 199 unique source references exactly cover the original 199 rows across 20 categories, all 199 severity values match the original stars, and all nine blank methods display “Not specified in source.” All source/nonblank method translation pairs were reviewed. The 43 quantitative rows were checked for retained numerical values and conditions; a token check accounts for written “Two” in the two-scratch row, and the one-year report age was also checked manually. The strict comparisons, OR conditions, 7-inch-inclusive wording and 5 mm/8-hour-inclusive conditions are retained. No criterion was dropped or severity silently corrected. The machine-readable verification report is `final-data-check.json` in the working evidence directory. Browser interaction, responsive layout and build verification remain separate checks.
