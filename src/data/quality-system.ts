export const systemControls = [
  { name: 'Agree the requirements', text: 'Review product specifications, reference samples, intended market, inspection requirements and delivery feasibility before committing production.', href: '/customization/how-we-work/', link: 'How we work' },
  { name: 'Control the approved version', text: 'Approve and distribute drawings, BOMs, work instructions and inspection instructions. Communicate changes and withdraw superseded versions from use.', href: '#document-control', link: 'Document control' },
  { name: 'Qualify materials and suppliers', text: 'Connect supplier approval and sample assessment with incoming verification, material status and follow-up on recurring quality problems.', href: '/quality/incoming-inspection/', link: 'Incoming inspection' },
  { name: 'Verify before release', text: 'Use first article approval, production checks, appropriate tests and final inspection records to support acceptance decisions.', href: '/quality/quality-control-process/', link: 'Quality control process' },
  { name: 'Keep the records connected', text: 'Link the agreed order and production records with material batches, inspection results and delivery information at the required traceability level.', href: '/quality/traceability/', link: 'Traceability & materials' },
  { name: 'Review and improve', text: 'Use customer feedback, process data and audit findings to investigate causes, verify corrective actions and update the working standard.', href: '#improvement', link: 'Corrective action' },
] as const;

export const qualityDocuments = [
  { document: 'Product requirements and reference samples', control: 'Confirm the specification, customer approval and applicable acceptance criteria.', purpose: 'A common basis for engineering, purchasing and inspection.' },
  { document: 'BOM and technical drawings', control: 'Approve revisions and communicate changes to the departments and suppliers concerned.', purpose: 'Materials and dimensions follow the agreed design.' },
  { document: 'Process flow, SOP and SIP', control: 'Make the relevant work and inspection instructions available at the operation; replace obsolete versions.', purpose: 'Production and inspection use the same current requirements.' },
  { document: 'Inspection, test and review records', control: 'Identify, collect and retain legible records with the responsible department and controlled access.', purpose: 'Decisions can be reviewed and investigated when needed.' },
] as const;

export const improvementSteps = [
  { name: 'Contain the issue', text: 'Identify the nonconforming material or product and control its use or release while the disposition is reviewed.' },
  { name: 'Understand the cause', text: 'Quality coordinates the relevant departments to investigate the issue, using inspection records, feedback and process information.' },
  { name: 'Assign the action', text: 'Define the correction and action to address the cause. Identify who is responsible for implementation and follow-up.' },
  { name: 'Verify the result', text: 'Check implementation and effectiveness. Reinspect repaired or reworked goods where required before acceptance.' },
  { name: 'Update the standard', text: 'Incorporate lasting changes into the controlled documents and communicate the revised requirements to the people concerned.' },
] as const;

export const qualityFaqs = [
  { question: 'How is your quality management system different from product inspection?', answer: 'Xinyinhai’s documented quality management system connects requirements, responsibilities, controlled documents, supplier management, records, internal review and corrective action. Product inspection is one part of that system: it verifies materials and products against the applicable acceptance criteria at defined stages.' },
  { question: 'How are drawing, BOM and inspection-standard changes controlled?', answer: 'The documented procedure requires review and approval of changes, controlled distribution to relevant users and withdrawal of obsolete versions. Changes affecting an order are reviewed and communicated with the customer. Product-certification changes also need the approvals applicable to that certified product.' },
  { question: 'How are quality problems followed through to closure?', answer: 'Nonconforming items are identified and controlled. The relevant departments investigate the cause and implement the agreed action. Quality follows implementation and verifies effectiveness before closure; lasting changes are incorporated into controlled documents.' },
  { question: 'What should we check when reviewing ISO 9001 certification?', answer: 'Check the current certificate, certified legal entity, factory location, scope, edition, certification body and validity. Match those details to the manufacturing site and work being sourced. A quality management system certificate is distinct from certification or test evidence for an individual product.' },
  { question: 'Can we review quality documents for a supplier assessment?', answer: 'Define the site, product, review topics and evidence required with your LEANODM contact. Relevant procedures, record examples and applicable certification information can then be discussed, including confidentiality, access and any customer-specific limits.' },
  { question: 'Does every product use the same inspection or testing plan?', answer: 'No. The applicable plan depends on the product, intended use, destination market, customer requirements and approved specification. Sampling, routine checks and external testing need to be agreed in that context.' },
] as const;

export const traceabilityRecords = [
  { stage: 'Order and requirement', record: 'Reviewed order / contract', links: 'Product, specification and agreed requirements', owner: 'Production planning and customer coordination' },
  { stage: 'Production instruction', record: 'Production work order', links: 'The order with production scope and requirements', owner: 'Production' },
  { stage: 'Materials used', record: 'Work record and material identification', links: 'Material batch and supplier information used in production', owner: 'Workshop and warehouse' },
  { stage: 'Inspection decision', record: 'Incoming, process and final inspection records', links: 'The inspected material or product lot, findings and decision', owner: 'Quality' },
  { stage: 'Delivery', record: 'Delivery note and finished-goods record', links: 'Product, quantity, delivery date and dispatch details', owner: 'Planning and warehouse' },
] as const;

export const traceFaqs = [
  { question: 'What does the documented traceability process connect?', answer: 'It connects the contract or order with the production work order, work records, material batches and suppliers, final inspection report and delivery note. Production planning defines the required traceability extent when it is needed by the contract, applicable requirements or internal management.' },
  { question: 'Do you provide serial-number tracking for every individual unit?', answer: 'The documented procedures describe order, material-batch, production and delivery records. They do not establish universal individual-unit serial tracking. Define any serial-number, barcode or digital-record requirements during the project review so feasibility and the required records can be agreed.' },
  { question: 'How are rejected materials kept from unintended use?', answer: 'Rejected materials are identified and placed in designated areas or containers while disposition is reviewed. Rework, return, scrap or an authorized concession follows the relevant approval route. Repaired or reworked products are checked again as required before acceptance.' },
  { question: 'How are customer-supplied materials managed?', answer: 'The product-protection procedure calls for customer-material identification, separate inventory records and suitable storage protection. It also calls for communication of abnormal material use and control to prevent customer-supplied material being used for another customer’s product.' },
  { question: 'How does traceability support a customer complaint or recall?', answer: 'Quality reviews the available production, inspection and delivery information to identify the affected scope. The relevant teams coordinate with the customer on containment and any agreed return or recall plan, isolate returned goods, investigate the cause and verify corrective action.' },
  { question: 'What information helps start a quality investigation?', answer: 'Provide the order or shipment reference, product and revision, visible batch or date code, affected quantity, defect description and photographs or samples. Preserve packaging labels where possible. These references help the team find the related records and assess the affected scope.' },
] as const;
