export const moldingRoute = '/manufacturing/tooling-injection-molding/';
export const moldingNavigation = [
  { label: 'In-house tooling', href: '#mold-preparation' },
  { label: 'Factory evidence', href: '#factory-evidence' },
  { label: 'Process control', href: '#process-control' },
  { label: 'Quality', href: '#molding-quality' },
  { label: 'FAQ', href: '#faq' },
] as const;

export const moldingFacts = [
  { value: '24', label: 'Injection molding machines', detail: 'Count in the supplied equipment inventory, corroborated by the workshop improvement report.' },
  { value: '98–380 T', label: 'Nominal clamping-force classes', detail: 'Range listed in the equipment inventory. T denotes the source’s machine tonnage designation.' },
  { value: 'Before production', label: 'First article confirmation', detail: 'Samples and inspection instructions connect setup to the production decision.' },
  { value: 'Xinyinhai’s toolroom', label: 'In-house tooling', detail: 'Milling and grinding support mold machining, adjustment and repair alongside molding.' },
];

export const moldingWorkflow = [
  { name: 'Tooling review', check: 'Development, tooling and molding teams review the mold design together; trial feedback informs modifications.', evidence: 'Development and mold-trial workflow' },
  { name: 'Mold preparation', check: 'Stage the mold, cooling connections and required handling tools.', evidence: 'Staging improvement record' },
  { name: 'Material preparation', check: 'Identify, dry and mix material to the applicable instructions.', evidence: 'Material and mixing standards' },
  { name: 'Machine setup', check: 'Check setup, auxiliary equipment and documented process settings.', evidence: 'Setup and handover instructions' },
  { name: 'First article', check: 'Confirm the molded sample and communicate product-specific inspection points.', evidence: 'First-article controls' },
  { name: 'Controlled production', check: 'Use the reference sample, work instructions and operator self-checks.', evidence: 'Production and training standards' },
  { name: 'In-process inspection', check: 'Check appearance and critical features; isolate abnormal output for review.', evidence: 'Molding quality instructions' },
  { name: 'Mass production', check: 'Carry confirmed settings, inspection feedback and shift handovers into repeat runs.', evidence: 'Production flow and handover standards' },
];

export const moldingEquipment = [
  { item: 'Injection molding machines', provision: '24 listed; 98–380 T nominal classes', purpose: 'Machine selection starts with the mold and component requirements.' },
  { item: 'Material preparation', provision: 'Drying hoppers and horizontal / vertical mixers', purpose: 'Prepare identified material before feeding the molding process.' },
  { item: 'Mold temperature control', provision: 'Water-temperature control units', purpose: 'Support the specified mold-temperature setup.' },
  { item: 'Part handling', provision: 'Take-out robots and conveyors', purpose: 'Support removal and transfer of molded parts.' },
  { item: 'Runner recovery', provision: 'Machine-side granulation and recovery; separate granulation equipment', purpose: 'Reduce handling where the applicable material and product requirements permit reuse.' },
  { item: 'In-house tooling support', provision: 'A grinder and a milling machine listed in the inventory', purpose: 'Support mold machining, adjustment and repair. Review the required operations for each new tool.' },
];

export const moldingControls = [
  { name: 'Material identification', text: 'Confirm the production material against the job information. After mixing, bag and label it so the prepared material remains identifiable.', evidence: 'Mixing standard: cleaning, staged mixing, bagging and labeling.' },
  { name: 'Drying and mixing', text: 'Use the material-specific drying temperature and duration, with a defined mixing sequence. Check the hopper, air path and feed opening during material change preparation.', evidence: 'Material parameter table and screw-cleaning training.' },
  { name: 'Machine and mold setup', text: 'Verify mold-to-machine fit, cooling connections, ejection and mold protection. Confirm the selected process settings before producing the first article.', evidence: 'Mold-installation instructions and setup checks.' },
  { name: 'Settings and shift handover', text: 'Check the production parameter sheet and auxiliary equipment. Technicians hand over abnormalities, improvements and parameter changes to the next shift.', evidence: 'Standardized technician handover and checkpoint list.' },
];

export const moldingQuality = [
  { name: 'First article', text: 'Confirm appearance, assembly fit and the product’s inspection priorities before routine production.' },
  { name: 'Operator self-check', text: 'Work to the processing sample and instructions; report defects and abnormal operating conditions.' },
  { name: 'Patrol inspection', text: 'Inspect appearance, structure, working methods and known problem areas during the run.' },
  { name: 'Abnormality isolation', text: 'Identify nonconforming parts and place them in the designated area awaiting disposition.' },
  { name: 'Corrective action', text: 'The technician investigates and adjusts the process, escalating unresolved issues to the production leader.' },
  { name: 'Verification', text: 'Quality personnel confirm the result; affected output requires a quality decision or the specified full inspection.' },
];

export const moldingRoles = [
  { role: 'Machine Operator', text: 'Follow the processing sample, check output, maintain workstation order and hand over the current quality status.' },
  { role: 'Process Technician', text: 'Prepare and set up the mold and machine, confirm parameters, address abnormalities and communicate changes.' },
  { role: 'Material Handler', text: 'Prepare and identify materials, follow mixing instructions and manage feeding and recovery tasks.' },
  { role: 'Quality Inspector', text: 'Confirm first articles, conduct focused patrol checks and verify abnormality disposition.' },
  { role: 'Production Leader', text: 'Coordinate work, review defects and unresolved issues, and follow up operator training and improvement suggestions.' },
];

export const moldingFaqs = [
  { question: 'Does Xinyinhai have an in-house toolroom?', answer: 'Yes. Xinyinhai’s in-house toolroom supports mold machining, maintenance and repair alongside injection molding. The equipment inventory lists milling and grinding machines. Development, tooling and molding teams review mold design and trial feedback together. The manufacturing scope and any external operations for a new tool are confirmed during project review.' },
  { question: 'How does mold-trial feedback reach the tooling team?', answer: 'The development workflow connects trial samples, testing and evaluation with a joint review and injection-molding feedback. Mold modifications feed into the next trial and review. This gives tooling and molding teams a shared sequence for resolving issues before the next production stage.' },
  { question: 'What injection molding machine sizes are documented?', answer: 'The supplied inventory lists 24 injection molding machines across 98–380 T nominal clamping-force classes. The workshop improvement report corroborates the count. Confirm the available machine and mold fit for your project; this is a documented equipment baseline, not a live capacity booking.' },
  { question: 'How do you control material drying?', answer: 'The internal material table defines material-specific drying temperatures and times alongside molding and mold-temperature settings. Preparation training also includes checking the drying hopper, air path and feed opening. The applicable material grade and job instructions govern the settings.' },
  { question: 'How do you manage mold maintenance?', answer: 'The instructions cover cleaning the parting surface, protecting vents, inserts and slides, checking rust-prevention coverage and clearing residual cooling water. The mold is returned to its assigned storage position and checked again during the next installation.' },
  { question: 'How do you control injection molding quality?', answer: 'First-article confirmation, operator self-checks and patrol inspection connect production to the reference sample and work instructions. Abnormal parts are identified and isolated. Technicians and quality personnel review corrective action and the disposition of affected output.' },
  { question: 'How do you reduce variation between samples and mass production?', answer: 'The documented controls connect the production parameter sheet, first-article sample, operating instructions and in-process checks. Technicians communicate parameter changes and abnormalities at shift handover, while product-specific training is repeated after a mold change.' },
  { question: 'Can you support OEM / ODM plastic electronic products?', answer: 'The factory overview identifies OEM and ODM work in plastic, electronic and toy products. These molding controls support evaluation of an OEM injection molding or ODM injection molding project. Product geometry, material, appearance, assembly requirements and destination-market requirements still need project review.' },
  { question: 'Is recovered runner material used for every product?', answer: 'The improvement report documents machine-side granulation and controlled runner recovery. The applicable material and product requirements must determine whether recovered material is suitable. The record does not establish a universal recycled-content specification.' },
];
