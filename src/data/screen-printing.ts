export const printingRoute = '/manufacturing/screen-printing/';

export const printingNavigation = [
  { label: 'Process', href: '#process' },
  { label: 'Positioning', href: '#fixture-positioning' },
  { label: 'Layers', href: '#layer-registration' },
  { label: 'Quality', href: '#quality-checks' },
  { label: 'Project brief', href: '#project-requirements' },
  { label: 'FAQ', href: '#faq' },
] as const;

export const printingControls = [
  { icon: 'scan-line', title: 'Print position', text: 'Locate the part in its fixture and check the graphic against the agreed placement.' },
  { icon: 'palette', title: 'Color consistency', text: 'Compare the printed color with the confirmed color or physical sample reference.' },
  { icon: 'type', title: 'Graphic clarity', text: 'Check that text, edges and graphic details are clear and complete.' },
  { icon: 'layers', title: 'Layer registration', text: 'Check that the surface layer aligns with the base layer and intended artwork.' },
  { icon: 'sparkles', title: 'Surface cleanliness', text: 'Look for visible dirt or unwanted marks on the plastic surface.' },
  { icon: 'shield-check', title: 'Part protection', text: 'Check for visible scratches or damage associated with handling.' },
] as const;

export const printingSteps = [
  { title: 'Artwork review', detail: 'Confirm artwork, print area, color reference and acceptance requirements.', icon: 'file-check-2', group: 'DEFINE' },
  { title: 'Part preparation', detail: 'Review material and finish; check the surface and handling needs.', icon: 'box', group: 'PREPARE' },
  { title: 'Fixture positioning', detail: 'Place the part in the locating fixture in the specified orientation.', icon: 'focus', group: 'LOCATE' },
  { title: 'Base-layer printing', detail: 'Lower the screen and print the first layer for the agreed sequence.', icon: 'panel-top', group: 'PRINT' },
  { title: 'Additional layer', detail: 'Position the base-printed part and align the surface layer.', icon: 'layers', group: 'REGISTER' },
  { title: 'Visual QC', detail: 'Check position, color, clarity, registration and part condition.', icon: 'scan-eye', group: 'INSPECT' },
  { title: 'Sample verification', detail: 'Compare the result with the approved sample and agreed requirements.', icon: 'clipboard-check', group: 'VERIFY' },
] as const;

export const printingChecks = [
  { title: 'Correct print location', detail: 'Graphic placement matches the specified position on the part.' },
  { title: 'Correct color', detail: 'The printed color agrees with the confirmed reference.' },
  { title: 'Clear graphic', detail: 'Text and graphic details are legible, with no obvious missing or blurred areas.' },
  { title: 'Accurate layer registration', detail: 'The printed layers align as intended in the artwork.' },
  { title: 'Clean plastic surface', detail: 'The visible surface is free of unwanted dirt and marks.' },
  { title: 'No visible handling damage', detail: 'The plastic part has no visible damage against the agreed cosmetic criteria.' },
  { title: 'Approved sample / requirement comparison', detail: 'The inspected part is checked against the agreed reference, not memory.' },
] as const;

export const printingRisks = [
  { risk: 'Misalignment', control: 'Specified part orientation + fixture positioning + print-location check.' },
  { risk: 'Blurred printing / incomplete ink transfer', control: 'Visual clarity and completeness check against the sample or artwork.' },
  { risk: 'Layer registration error', control: 'Positioning at each print stage + comparison of the combined graphic.' },
  { risk: 'Wrong color', control: 'Color reference confirmation + visual comparison of the printed result.' },
  { risk: 'Surface contamination', control: 'Surface cleanliness check during preparation and final visual inspection.' },
  { risk: 'Scratches / handling damage', control: 'Agree part-handling needs + inspect the plastic surface for damage.' },
] as const;

export const printingRequirements = [
  { title: 'Artwork / vector file', detail: 'Editable artwork, outlined text, artwork revision and separate layers or colors where applicable.', tag: 'ARTWORK' },
  { title: 'Printing location', detail: 'Part drawing with print area, orientation, dimensions and reference edges.', tag: 'DRAWING' },
  { title: 'Color requirement', detail: 'Pantone reference where specified, number of colors and a physical color sample if available.', tag: 'COLOR' },
  { title: 'Part material', detail: 'Plastic type and grade if known, molded color, and whether parts are supplied or need molding.', tag: 'MATERIAL' },
  { title: 'Surface finish', detail: 'Texture, gloss, coating and any surface features that affect print access or appearance.', tag: 'SURFACE' },
  { title: 'Approved sample', detail: 'Reference part or representative sample, with approved artwork and revision identified.', tag: 'REFERENCE' },
  { title: 'Cosmetic acceptance criteria', detail: 'Viewing requirements, critical areas and any required adhesion, wear or chemical-resistance tests.', tag: 'ACCEPTANCE' },
  { title: 'Expected production volume', detail: 'Trial quantity, order quantity, repeat-order forecast and target schedule.', tag: 'QUANTITY' },
] as const;

export const printingApplications = [
  { icon: 'monitor', title: 'Consumer electronics housings', text: 'Brand marks, product text and interface graphics on accessible plastic surfaces.' },
  { icon: 'gamepad-2', title: 'Interactive & educational products', text: 'Symbols, simple instructions and graphics reviewed with the product function.' },
  { icon: 'gift', title: 'Electronic gifts & promotional products', text: 'Customer-authorized artwork and logo placement on the selected product.' },
  { icon: 'panel-top', title: 'Enclosures, buttons & accessories', text: 'Legends and identification graphics, subject to geometry and material review.' },
] as const;

export const printingMethods = [
  { name: 'Screen printing', use: 'Direct ink graphics on a surface the screen can reach.', review: 'Print area, surface geometry, ink/material compatibility and the layer sequence.' },
  { name: 'Pad printing', use: 'Graphics transferred with a flexible pad onto shaped surfaces.', review: 'Pad access, geometry and graphic dimensions; confirm by trials.' },
  { name: 'Labels / stickers', use: 'Artwork carried on an applied label.', review: 'Adhesive compatibility, surface texture, label edges and use conditions.' },
  { name: 'In-mold decoration', use: 'Decoration integrated during molding.', review: 'Coordinate tooling, film/resin compatibility and the molded part design.' },
  { name: 'Laser marking', use: 'Identification marks on a compatible material.', review: 'Test the actual resin and color for suitable contrast and appearance.' },
] as const;

export const printingFaqs = [
  { question: 'What is screen printing on plastic products?', answer: 'Screen printing transfers ink through a patterned screen onto a plastic surface to form logos, text or graphics. Part geometry, material, surface finish and artwork determine whether the process is suitable.' },
  { question: 'Can you screen print logos on injection-molded plastic parts?', answer: 'We can review logo and graphic printing as part of a plastic or electronic product manufacturing project. Share the molded part, material, surface finish and artwork so print access, positioning and the required result can be assessed before quotation.' },
  { question: 'How do you control print position?', answer: 'The archived work instructions specify placing the plastic part into a locating fixture in a defined orientation before lowering the screen. Visual inspection then checks the print location. For a new part, the fixture and acceptance requirements must be defined for that geometry.' },
  { question: 'How do you control multi-color or multi-layer registration?', answer: 'The documented example uses a base-layer operation followed by positioning the base-printed part for a surface-layer operation. QC checks the alignment of the printed layers against the reference sample. The number of layers, their order and the setup are agreed for each new artwork.' },
  { question: 'What artwork files are required for screen printing?', answer: 'Provide editable vector artwork where available, with text outlined, the artwork revision identified and colors or layers separated where applicable. Include a dimensioned placement drawing, color references and a sample if available. Confirm the accepted file format during the project review.' },
  { question: 'Can screen printing be integrated with injection molding and assembly?', answer: 'Yes. Printing can be reviewed alongside molding, assembly, inspection and packaging for a manufacturing project at Xinyinhai. The sequence depends on access to the printing surface, part handling and the agreed assembly plan; decoration may need to take place before assembly.' },
  { question: 'How do you inspect screen-printed plastic parts?', answer: 'The archived inspection instruction checks print position, correct color, graphic clarity, layer registration, surface cleanliness and absence of damage, with reference to the sample. Any additional adhesion, abrasion or chemical-resistance requirements must be specified and confirmed for the project.' },
  { question: 'Is screen printing suitable for low-volume custom products?', answer: 'Suitability depends on screen and fixture preparation, the number of colors, part geometry and the quantity. Share the trial and production volumes for review. No universal minimum order quantity or cost advantage is assumed before the project is assessed.' },
] as const;
