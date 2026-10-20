// Editorial summaries of the supplied workbook. Cell references and scope decisions
// are retained in docs/quality/quality-control-process-source-qa.md, not in public assets.
export const stages = [
  { name: 'Incoming material inspection', target: 'incoming', check: 'IQC checks incoming materials and outsourced parts against engineering requirements and reference samples.', purpose: 'An acceptance or rejection decision is recorded before materials move into production.' },
  { name: 'First article approval', target: 'first-article', check: 'Inspect function, appearance, consistency and applicable safety requirements on the first submitted products.', purpose: 'Normal batch production is authorized only after the first article is accepted and approved.' },
  { name: 'In-process inspection', target: 'in-process', check: 'Inspectors review production requirements, patrol the workshop and sample output during production.', purpose: 'Abnormalities are reported and addressed while the process is running.' },
  { name: 'Process-specific checks', target: 'process-checks', check: 'Assigned inspectors cover plastic molding, COB / bonding / SMT, soldering, printing and assembly.', purpose: 'These responsibilities operate within production to prevent nonconforming work reaching the next process.' },
  { name: 'Final product inspection', target: 'final-inspection', check: 'For toy finished goods, inspect packaging, appearance, function and applicable safety requirements.', purpose: 'Final QA records defects, counts and the lot acceptance decision.' },
  { name: 'Acceptance for release', target: 'release', check: 'Accepted results and signed inspection reports provide the quality basis for release.', purpose: 'Rejected lots require disposition. Test specimens covered by the finished-product safety test procedure are excluded from shipment.' },
];

export const responsibilities = [
  { role: 'Quality Manager / Supervisor', text: 'Directs quality department work, guides inspectors, and follows up corrective actions across departments with documented review.' },
  { role: 'Quality Engineer (QE)', text: 'Defines inspection procedures and sampling plans, evaluates process changes, manages inspection and test records, and coordinates responses to significant quality issues.' },
  { role: 'Incoming Quality Control (IQC)', text: 'Accepts or rejects raw and auxiliary materials and subcontracted parts, reports problems to suppliers and Purchasing, and periodically evaluates suppliers.' },
  { role: 'In-Process Inspectors', text: 'Check work against process requirements, judge product conformity, prevent defective output reaching the next operation, and report quality issues.' },
  { role: 'Final Inspection QA', text: 'Inspects finished goods, makes the acceptance decision, supports customer or third-party inspections, and monitors follow-up on rejected lots.' },
];

export const safetyChecks = [
  { name: 'Small Parts Test', text: 'Check applicable toy products under the small-parts test work instruction.' },
  { name: 'Sharp Point Test', text: 'Apply where a product or component may present a sharp-point hazard during normal use or abuse.' },
  { name: 'Tension Test', text: 'Evaluate the relevant parts under the specified pull-test procedure.' },
  { name: 'Compression Test', text: 'Apply the prescribed pressure-test procedure for the product and market.' },
  { name: 'Drop Test', text: 'Evaluate applicable toy products under the relevant drop-test instruction.' },
];

export const processes = [
  { name: 'Plastic Molding', checks: 'Check molding operations against process requirements. First-article checks for plastic housings include color, structure and trimming.' },
  { name: 'COB / Bonding / SMT', checks: 'Verify that operators follow the process instructions; inspect COB output and determine acceptance or rejection.' },
  { name: 'Soldering', checks: 'Check soldering operations and the conformity of soldered products before they move to the next process.' },
  { name: 'Printing', checks: 'Check printing operations and printed-product conformity. Coated products also have applicable adhesion checks.' },
  { name: 'Assembly', checks: 'Inspect semi-finished and finished assemblies. First-article checks cover function, appearance and applicable packaging consistency.' },
];

export const finalChecks = [
  { name: 'Packaging & accessories', text: 'Outer cartons, individual packaging, correct components, missing accessories and packaging damage.' },
  { name: 'Appearance & workmanship', text: 'Surface condition, color, scratches, molding defects, housing fit and assembly workmanship against the reference sample.' },
  { name: 'Printing & marking', text: 'Legibility, completeness, print color, product descriptions and required warning information.' },
  { name: 'Function & specifications', text: 'Specified product functions, switches, sound or display where relevant, and conformity to the product requirements.' },
  { name: 'Labels & date codes', text: 'Correct label content, placement and quantity; date-code content, marking method and position.' },
  { name: 'Foreign material & contamination', text: 'Conductive debris, other foreign material and contamination in or on the product and packaging.' },
  { name: 'Safety-related requirements', text: 'Applicable mechanical safety tests, accessible points or edges, battery-related hazards and required safety markings.' },
  { name: 'Product consistency', text: 'Correct parts, nameplates, battery specifications and agreement with the required model and approved sample.' },
];

export const defects = [
  { code: 'CR', name: 'Critical', definition: 'A safety defect that may cause serious injury or illness during assembly, operation or use, or fail legal or regulatory requirements.', aql: '0' },
  { code: 'MAJ', name: 'Major', definition: 'A functional or appearance defect that may make the product unsaleable and is likely to cause returns, significant customer dissatisfaction or discontinued orders.', aql: '0.65' },
  { code: 'MIN', name: 'Minor', definition: 'A noticeable defect unlikely to cause returns or complaints, but which may negatively affect the customer’s view of product quality.', aql: '1.0' },
];

export const documents = [
  { name: 'Quality Organization & Responsibilities', code: 'WI-COP1.1-11', detail: 'Defined management, engineering, IQC, process inspection and final QA duties.' },
  { name: 'First Article Inspection Standard', code: 'WI-COP-7.1.1-01', detail: 'Version B · Quality Department · revision shown: 28 December 2017.' },
  { name: 'Finished Product Inspection Standard', code: 'WI-COP-8.2.4-01', detail: 'Version F · Quality Department · revision shown: 28 December 2017.' },
];

export const faqs = [
  { question: 'What is your quality control process?', answer: 'The documented process combines incoming material inspection, first article approval, workshop patrol inspection, process-specific inspection and final QA. Inspection results support acceptance, rejection and follow-up decisions. The finished-product standard summarized here applies to toy finished goods.' },
  { question: 'Do you inspect incoming materials?', answer: 'IQC is responsible for inspecting raw and auxiliary materials and subcontracted parts. Checks include dimensions, function, technical parameters and appearance against engineering requirements or samples. Results are recorded, and incoming quality problems are reported to suppliers and Purchasing.' },
  { question: 'Do you conduct first article inspection before mass production?', answer: 'Yes. Production submits first articles for inspection. Under the first-article standard, all inspection and test items must pass; one failing specimen on any item makes the submitted first-article batch unacceptable. Results and samples are submitted for approval before normal batch production is authorized.' },
  { question: 'How do you control quality during production?', answer: 'Assigned inspectors review production instructions, technical documents and samples, confirm first articles, patrol operations and sample production output. The supplied patrol standard specifies checks at two-hour intervals in the workshops it covers. Abnormalities are recorded and escalated, and reworked rejected lots must be reinspected.' },
  { question: 'What is checked during final product inspection?', answer: 'The toy finished-product standard covers carton and individual packaging, appearance, printing, marking, function, specification consistency, foreign material, labels and date codes, plus applicable safety checks. Final QA records defect descriptions, counts and the lot decision in a signed report.' },
  { question: 'How do you classify Critical, Major and Minor defects?', answer: 'In the finished-product standard, Critical defects concern safety or legal requirements. Major defects are functional or appearance problems likely to make a product unsaleable or cause returns and significant dissatisfaction. Minor defects are noticeable issues unlikely to cause returns or complaints. A unit with several defect classes is counted under its highest severity; individual inspection criteria still govern the decision.' },
  { question: 'Do you use AQL inspection?', answer: 'Yes. The supplied process workbook specifies single sampling, General Inspection Level II for general checks, and AQL labels CR 0, MAJ 0.65 and MIN 1.0 for incoming, in-process product sampling and final inspection. Final carton selection uses S-4. These values are specific to this workbook: the separate incoming-material reference published on this site lists MIN 2.5. Confirm the applicable document and customer requirements for the order; the values are not interchangeable.' },
  { question: 'What toy safety tests are specified before production release?', answer: 'For applicable toy products, the first-article standard lists Small Parts, Sharp Point, Tension, Compression and Drop Tests. Sharp-point testing is conditional on the relevant hazard. Requirements depend on the product, destination market and customer criteria; the documents reference ASTM F963 for the USA and EN71 for Europe. These references do not establish certification or universal product compliance.' },
  { question: 'How do you handle nonconforming products?', answer: 'Failed first articles are reviewed with Engineering and Production, corrected and resubmitted. Production abnormalities are recorded and escalated for action; rejected production lots are reinspected after rework. Rejected incoming materials follow the documented disposition and review process. Final QA monitors rejected-lot follow-up and retains the inspection decision.' },
  { question: 'Can customer-specific inspection standards be applied?', answer: 'The first-article, patrol and finished-product standards provide for customer inspection requirements or acceptance levels higher than the factory’s requirements. Share the specification, drawings, reference sample, target market and expected acceptance criteria so the applicable requirements can be reviewed for the project.' },
];
