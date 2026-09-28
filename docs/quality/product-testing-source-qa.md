# Product test plan — source QA

## Source inventory

- Source: `产品测试评价计划表11.xlsx`; visible title: `产品测试计划书` (Product Test Plan).
- Organization in the sheet: `深圳市鑫银海电子有限公司` (Shenzhen Xinyinhai Electronics Co., Ltd.). The organization name is quoted from this source; no new address or legal-entity claim is added.
- SHA-256: `276b2061822715b82c7a2db2818137fbcc83001c9fb166ee3b3d2e47941c6efb`.
- One visible worksheet, `Table 1`, A1:T24; 312 populated cells; 15 merged ranges; no cell comments, hidden rows or hidden columns. No formulas or calculated results are present.
- Left block A:I: source heading “信赖性测试” (reliability tests), 20 projects. Right block K:S: source heading “安全性测试” (safety tests), 19 projects. These headings are not silently swapped. Public navigation groups are explicitly editorial.
- Left project 6 spans rows 9–10: one merged project name, separate ISO-labeled and EN-labeled methods, equal stage marks and criteria. Both methods are retained, making 40 substantive method rows across 39 projects.
- The drawings XML contains no text. It includes a divider, graphical shapes and two image references anchored to row 21 in column I. Both embedded PNGs were inspected and copied byte-for-byte: left OK (109×114), right NG (116×115). No new laboratory images are used.
- K23:M24 labels the sample row; N23:R24 gives 10, 10, 20, “1C + 25”, 5. “C” is undefined. These are not multiplied by test counts or assigned to every test.
- No revision/effective date, completed measurements, pass rates, certification evidence or equipment-ownership records are supplied.

## Clarification and preservation decisions

The user was asked about four safety/acceptance ambiguities and explicitly instructed: “你就直接用原来的写法即可，不要较真” (use the original wording). The public page therefore retains those expressions without selecting a guessed interpretation:

1. C9/C10: preserve “1.08 ±5CM” / “1.08 ± 5CM”; do not assume the base value is metres.
2. C12: retain 90 N ± 2 N, the under-2 mm wording, the gap exception, height 2–6 mm / 70 N, and L ≥ 6 mm / 90 N. Do not repair the 6 mm overlap, define L, or apply ±2 N to 70 N by inference.
3. C18: retain outer dimension 3.2 cm, height ≥6 mm, under-3-years applicability, 11 kg load and 10 seconds. Do not add a dimension direction or comparison operator to 3.2 cm.
4. I22: retain “印刷100/5正常合格” and provide only a literal English gloss. Do not translate 100/5 into a 5% detachment allowance.

Other localized issues stay with their entries: undefined T1/T2/TN/PP/MP; undefined PP sample C; undefined bundle *2 marker (not treated as multiplication); unspecified acoustic notation/settings; incomplete EN/ISO/JIS identification; unspecified vibration-amplitude convention; unprovided electrical limits; unprovided monthly use inputs; no numeric current/battery-life/destructive-tension acceptance limits; unclear paper-material substitution in the temperature cycle; no carton-height rounding rule. Source units such as kg and g/cm² are not converted to Newtons or pressure units.

For environmental rows, powered-on exposure is retained only where stated. Thermal shock has a power-on check after recovery, not an invented powered-on exposure. Paper/synthetic-paper exceptions retain 40 °C / 75% humidity. The outer-carton load preserves N = 3.5 m ÷ height and (N − 1) × carton weight, 100 h exposure, recovery, dimensional and functional conditions.

## Coverage map

The method, criteria and source notes for every row were manually read against the extraction and independently reviewed. The script also compares original cell stage marks and all source numeric values. Its numeric presence check complements rather than replaces semantic review. The source XLSX and working extraction remain outside the repository.

| Source cells | Project | Stages | Source notes retained |
| --- | --- | --- | --- |
| Table 1!B4:I4 | Accessible external parts | T1, T2, TN, PP, MP | No additional ambiguity identified. |
| Table 1!B9:I10 | Unpackaged product drop | T1, T2, TN, PP, MP | Original height notation is retained. The source does not clearly distinguish the base-height unit from the tolerance unit; no conversion to metres is inferred. |
| Table 1!B11:I11 | Torque followed by tension | T1, T2, TN, PP, MP | No additional ambiguity identified. |
| Table 1!B12:I12 | General tensile test | T1, T2, TN, PP, MP | Original size/load wording is retained, including “测试样品要求高度2mm以下”. The relationship between height and gap, the overlapping 6 mm boundary, the meaning of L and tolerance applicability to 70 N are not resolved by the source. |
| Table 1!B13:I13 | Destructive tensile characterization | T1, T2, TN, PP | This is a recorded measurement; the source supplies no separate pass/fail threshold. |
| Table 1!B14:I14 | Compression | T1, T2, TN, PP, MP | The source does not specify the disc diameter. |
| Table 1!B15:I15 | Stepping load | T1, T2, TN, PP, MP | No additional ambiguity identified. |
| Table 1!B16:I16 | Impact | T1, T2, TN, PP, MP | No additional ambiguity identified. |
| Table 1!B17:I17 | Gap and hole probes | T1, T2, TN | No additional ambiguity identified. |
| Table 1!B18:I18 | Bite load | T1, T2, TN, PP | Original wording: “外形3.2cm, 高度6mm以上”. The direction and comparison operator for 3.2 cm are not stated. The 11 kg load is retained in the source unit without conversion to force. |
| Table 1!B20:I20 | Body-to-book attachment tension | T1, T2, TN, PP, MP | The source states the load in kg and gives no holding time. |
| Table 1!B5:I5 | Reversed battery installation | T1, T2, TN, PP | No additional ambiguity identified. |
| Table 1!B6:I6 | Correctly installed battery storage | T1, T2, TN, PP | No additional ambiguity identified. |
| Table 1!B7:I7 | Alternative batteries | T1, T2, TN, PP | The source does not specify battery brands, sizes or a list of approved alternatives. |
| Table 1!B8:I8 | Operating current | T1, T2, TN, PP | The source names the four quantities and units but supplies no numeric acceptance limits. |
| Table 1!B19:I19 | Sound level | T1, T2, TN, PP, MP | LPC peak and LPA are reproduced without expanding the undefined notation. Weighting, detector settings and the full acoustic method are not specified; no acoustic-compliance result is asserted. |
| Table 1!L6:S6 | Battery operating life | TN, PP | The source does not supply a minimum operating-time requirement. |
| Table 1!L20:S20 | Electrostatic tolerance | TN | The source does not specify the discharge mode, waveform, apparatus or number of discharges. This is a plan entry, not a complete ESD protocol or a result. |
| Table 1!L4:S4 | Switch durability | T1, T2, TN, PP | Monthly use and service-life inputs are not supplied. These example counts are not a universal service-life rating. |
| Table 1!L5:S5 | Button durability | T1, T2, TN, PP | Monthly use and service-life inputs are not supplied. |
| Table 1!L7:S7 | Picture-book opening durability | T1, T2, TN, PP | No additional ambiguity identified. |
| Table 1!L8:S8 | Operation at specified temperatures | TN, PP | No additional ambiguity identified. |
| Table 1!L9:S9 | High temperature and high humidity | TN, PP | No additional ambiguity identified. |
| Table 1!L10:S10 | High temperature | TN, PP | The source retains a humidity condition even though this row is titled high-temperature testing. |
| Table 1!L11:S11 | Low temperature | TN, PP | No additional ambiguity identified. |
| Table 1!L12:S12 | Temperature cycling | TN, PP | Confirm how the paper / synthetic-paper exception is applied to the cycle before using that variant. No humidity is supplied for the general cycle. |
| Table 1!L21:S21 | Salt spray on screws and battery contacts | TN | No additional ambiguity identified. |
| Table 1!L22:S22 | Thermal shock | TN | The source specifies power-on evaluation after recovery; it does not say that power remains on during thermal-shock exposure. |
| Table 1!L13:S13 | Outer-carton vibration | PP | Electrical acceptance limits are referenced but not supplied. Amplitude is retained without inferring peak-to-peak or single-peak convention. |
| Table 1!L14:S14 | Outer-carton drop | PP | The source supplies no edition of JIS A 5705 or numeric electrical acceptance limits. |
| Table 1!L15:S15 | Outer-carton stacking load | PP | The source gives no rounding rule for N and no numeric electrical acceptance limits. No rounding or assumed carton weight is added. |
| Table 1!L16:S16 | Bundled-product drop | TN, PP | The source attaches an unexplained “*2” marker to the bundle-height statement. It is not applied as a multiplier; confirm the bundle configuration. |
| Table 1!L17:S17 | Bundled-product vibration | TN, PP | The source’s “*2” marker is undefined and is not applied as a multiplier. The amplitude convention is not specified. Confirm the bundle configuration. |
| Table 1!L18:S18 | Bundled-product load | TN, PP | The source’s “*2” marker is undefined and is not applied as a multiplier. Confirm the bundle configuration. |
| Table 1!L19:S19 | Individual-product load | TN, PP | No additional ambiguity identified. |
| Table 1!B21:I21 | Book-cover lining bond | T1, T2, TN, PP, MP | The source provides two small visual examples, with no written peel-force limit. Use the approved product reference to resolve appearance details. |
| Table 1!B22:I22 | Printed-surface cross-cut adhesion | T1, T2, TN, PP, MP | The source does not define “100/5”. It is not interpreted here as a percentage or a permitted number of detached squares. |
| Table 1!B23:I23 | Printed-surface abrasion | T1, T2, TN, PP, MP | The source does not further define how a back-and-forth repetition is counted. |
| Table 1!B24:I24 | Printed-surface pencil loading | T1, T2, TN, PP, MP | No additional ambiguity identified. |

## Validation result

Source coverage: 39/39 projects, both merged drop methods, all 40 method rows, all numeric values, source stage marks and original image bytes checked. Stage counts by project: T1 23, T2 23, TN 36, PP 35, MP 13. The two drop method rows share a single project count.

See `product-testing-implementation.md` for build, browser and release checks.
