// Summaries of existing business content; see docs/rfq-delivery.md for source mapping.
export const rfqProjectOptions = [
  { value: 'existing-products', label: 'Existing Product Customization', icon: 'palette', text: 'Add your branding, color or packaging to a suitable base product.' },
  { value: 'product-adaptation', label: 'Product Adaptation', icon: 'component', text: 'Change the structure or functions of an existing product.' },
  { value: 'new-product-development', label: 'New Product Development', icon: 'lightbulb', text: 'Turn an idea into a product through agreed engineering work.' },
  { value: 'oem-manufacturing', label: 'OEM Manufacturing', icon: 'factory', text: 'Manufacture your approved design to agreed specifications.' },
  { value: 'not-sure', label: 'Not sure — help me choose', icon: 'circle-help', text: 'Tell us what you have and what you want to achieve.' },
] as const;
export const rfqProjectPrompts = [
  { type: 'existing-products', name: 'customizationNotes', label: 'Base product & customization', hint: 'Which style or model? Add any logo, color, finish or packaging ideas.', placeholder: 'For example: our logo on the housing, blue color and a retail gift box.' },
  { type: 'product-adaptation', name: 'adaptationNotes', label: 'Existing product & changes', hint: 'What exists today, and which parts or functions would you like to change?', placeholder: 'Photos or a reference help. Mention electronics, power, plastic parts or materials only if relevant.' },
  { type: 'new-product-development', name: 'developmentNotes', label: 'Use & core functions', hint: 'Who will use it, and what should it do? Unknown details are fine.', placeholder: 'Add power, electronic functions or plastic structure ideas if known. For software or connected features, tell us what your team will provide.' },
  { type: 'oem-manufacturing', name: 'oemNotes', label: 'Design readiness & available files', hint: 'Do you have approved drawings, a parts list (BOM), specifications or a sample?', placeholder: 'Tell us what is ready and what needs review. Note tooling status and any firmware or software your team will supply.' },
] as const;
export const rfqCapabilities = [
  { title: 'Tooling & injection molding', icon: 'wrench', href: '/manufacturing/tooling-injection-molding/', text: 'Xinyinhai’s in-house toolroom supports mold machining, adjustment and repair alongside injection molding.' },
  { title: 'Electronics & SMT', icon: 'cpu', href: '/manufacturing/electronics-smt/', text: 'Xinyinhai’s in-house electronics development and SMT assembly are reviewed against your product requirements.' },
  { title: 'Assembly & packaging', icon: 'package-check', href: '/manufacturing/assembly-packaging/', text: 'Component assembly and final packaging can be included in an agreed OEM/ODM scope.' },
  { title: 'Quality control', icon: 'shield-check', href: '/quality/quality-control-process/', text: 'Xinyinhai’s documented quality route covers incoming checks, first articles, process inspection and final release.' },
] as const;
export const rfqSteps = [
  { title: 'Review your starting point', text: 'Clarify the product, intended use and available information.' },
  { title: 'Define a workable scope', text: 'Review feasibility, missing inputs and responsibilities on both sides.' },
  { title: 'Agree the next stage', text: 'Define quotation scope, deliverables and the relevant sample or production reviews.' },
] as const;
export const rfqFaqs = [
  { question: 'Can I contact you with only an idea?', answer: 'Yes. Start with the intended user, product use and essential functions. Complete engineering files are not needed for an initial discussion. We review what must be clarified and whether the project fits our plastic and electronic product work.' },
  { question: 'What should I prepare?', answer: 'Your email and a non-sensitive project overview are enough to begin. Describe the intended use, main functions, project stage and approximate quantity if known. Detailed drawings, programs, keys and other restricted information follow through agreed channels after confidentiality arrangements are confirmed. For OEM manufacturing, the approved design and specifications form the production baseline; any redesign needs a separate agreement.' },
  { question: 'What if the quantity or delivery date is undecided?', answer: 'Leave them blank or write “Not decided.” A rough estimate can help later. Minimum order, pricing and timing depend on the product, tooling, materials, packaging and required verification, and are confirmed after project review.' },
  { question: 'How should I raise confidentiality needs?', answer: 'Select the NDA discussion option and start with a non-sensitive overview. We can review your own NDA and agree the confidentiality and information-exchange arrangements before detailed files are shared. The checkbox requests a discussion; the NDA is signed separately through a process both parties confirm.' },
] as const;
