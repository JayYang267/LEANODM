// Reusable procurement terms; commitments are confirmed in the project agreement.
export const commercialDetails = [
  {
    title: 'Development & tooling',
    text: 'Define the work, samples, files and acceptance covered by each fee. Include revision limits, validation, added requirements, cancellation and the outputs available at each paid stage.',
  },
  {
    title: 'Payment & milestones',
    text: 'Connect payments to agreed outputs and approvals. Identify contracting and payment parties, schedule inputs and approval dates, with terms for delays and changes. Amounts and percentages follow the project agreement.',
  },
  {
    title: 'Deliverables & handover',
    text: 'List goods, samples, records, tools and technical files for delivery. Specify ownership or usage rights, third-party restrictions, maintenance and transfer conditions, including treatment of unfinished work.',
  },
] as const;

export const commonProcurementFaqs = [
  {
    question: 'Can we review a sample before ordering production?',
    answer: 'Yes. The published development route uses samples and review gates before production preparation. Each sample has a defined purpose and identifies the materials, function and finish it represents. The project plan records acceptance, revisions and any additional production-readiness checks so the sample decision has a clear scope.',
  },
  {
    question: 'What development, sample or tooling fees should we expect?',
    answer: 'Fees follow the agreed development and production scope. A useful quotation separates the applicable engineering, sample, tooling and testing costs, with outputs, included revisions and exclusions for each item. The published review process assesses changes against remaining work, cost and schedule before the next authorized stage.',
  },
  {
    question: 'Can we discuss confidentiality or an NDA?',
    answer: 'Yes, an NDA can be reviewed before sensitive files are exchanged. Begin with a non-confidential overview, then agree the protected information, purpose, access and any subcontractor involvement. Publication, return and deletion terms can be included. The accepted agreement and authorized parties determine the arrangement for your project.',
  },
  {
    question: 'How is production kept consistent with the approved sample?',
    answer: 'Xinyinhai’s documented controls connect approved technical files with work and inspection instructions. First-article approval, process checks and final QA provide acceptance decisions, while changes follow document control. The project plan identifies the reference sample, applicable versions and lot records needed to apply those controls to the actual order.',
  },
  {
    question: 'Can you support testing for our destination market?',
    answer: 'Testing support starts with the actual product, intended users and destination market. The published controls address test planning, instrument accuracy and external-laboratory capability. Your plan identifies the applicable methods, samples, report scope, costs and responsible parties. Product reports must match the configuration; the factory process references do not establish product approval.',
  },
  {
    question: 'Can we arrange a third-party inspection?',
    answer: 'Yes. Xinyinhai’s documented final-QA responsibilities include support for customer and third-party inspections and rejected-lot follow-up. Set the stage, access, sampling, checklist and reporting for your order. Defect findings, correction and reinspection need an agreed decision route, with cost and delivery effects addressed in the order terms.',
  },
] as const;
