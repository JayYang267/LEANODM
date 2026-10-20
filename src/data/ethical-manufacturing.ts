export const ethicalMeta = {
  title: 'Ethical Manufacturing | Supplier Review | LEANODM.com',
  description: 'Review Xinyinhai’s documented labor, workplace safety, environmental and business-ethics procedures, with evidence summaries for supplier qualification on LEANODM.com.',
};

export const managementAreas = [
  { id: 'labor-rights', name: 'Labor rights', icon: 'badge-check', scope: 'Recruitment · working conditions' },
  { id: 'worker-voice', name: 'Worker voice & welfare', icon: 'messages-square', scope: 'Representation · feedback' },
  { id: 'workplace-safety', name: 'Health & safety', icon: 'hard-hat', scope: 'Hazards · protection · response' },
  { id: 'environment', name: 'Environment', icon: 'leaf', scope: 'Chemicals · waste · housekeeping' },
  { id: 'business-ethics', name: 'Business ethics', icon: 'handshake', scope: 'Integrity · supplier expectations' },
  { id: 'training-review', name: 'Training & review', icon: 'refresh-cw', scope: 'Learning · action · follow-up' },
];

export const ethicalNavigation = [
  { label: 'People', href: '#labor-rights' },
  { label: 'Safety & Environment', href: '#workplace-safety' },
  { label: 'Ethics & Review', href: '#business-ethics' },
  { label: 'Evidence', href: '#evidence' },
  { label: 'Buyer FAQ', href: '#qualification-faq' },
];

export const laborControls = [
  { title: 'Recruitment & age checks', text: 'Recruitment rules require identity and age checks, prohibit child and forced labor, and prohibit retention of identity documents or recruitment deposits.' },
  { title: 'Young-worker protection', text: 'The procedures address suitable work, restrictions on hazardous tasks, health checks and training for young workers.' },
  { title: 'Working time & pay records', text: 'Documented rules cover voluntary overtime, employee review of attendance records and itemized payroll information.' },
  { title: 'Respectful treatment', text: 'Policies prohibit discrimination, harassment, and mental or physical abuse. Complaint handling is linked to investigation and feedback.' },
];

export const safetyControls = [
  { icon: 'settings', title: 'Machinery & energy', text: 'Maintenance and energy-isolation procedures address equipment checks and control of hazardous energy.' },
  { icon: 'hard-hat', title: 'Personal protection', text: 'PPE rules identify task-related protection and cover use, storage, cleaning, replacement and selected equipment checks.' },
  { icon: 'flame', title: 'Fire & emergencies', text: 'Procedures assign response responsibilities and cover alarm, evacuation and emergency preparation.' },
  { icon: 'heart-pulse', title: 'Health & first aid', text: 'The documents address first-aid support, occupational-health precautions and incident reporting.' },
  { icon: 'flask-conical', title: 'Chemical handling', text: 'Rules cover identification, designated storage, safety information, inspections and escalation of abnormalities.' },
  { icon: 'clipboard-check', title: 'Workplace inspections', text: 'The premises procedure links recorded findings to responsible-department action and follow-up checks.' },
];

export const reviewSteps = [
  { icon: 'graduation-cap', title: 'Train', text: 'Induction, role instruction and assessment records.' },
  { icon: 'clipboard-check', title: 'Inspect & review', text: 'Workplace checks and internal-audit evidence.' },
  { icon: 'search', title: 'Identify the issue', text: 'Record findings and investigate relevant causes.' },
  { icon: 'wrench', title: 'Assign action', text: 'Set corrective measures and responsibilities.' },
  { icon: 'list-checks', title: 'Verify the response', text: 'Follow up the corrective action and its effectiveness.' },
  { icon: 'refresh-cw', title: 'Review & improve', text: 'Bring action status into management decisions.' },
];

export const evidenceItems = [
  {
    id: 'risk', number: '01', title: 'Risk assessment', area: 'Health, safety & environment', kind: 'Procedure summary',
    controls: 'Risks associated with new materials, equipment, processes and products.',
    use: 'EHS participants identify hazards and propose controls. The procedure calls for safety review of the report, followed by implementation of the specified controls.',
    source: 'New-material Risk Assessment Procedure',
    note: 'Shows assessment requirements; no completed assessment is presented.',
  },
  {
    id: 'training', number: '02', title: 'Training & learning records', area: 'Training & worker safety', kind: 'Procedure summary',
    controls: 'Induction, job-specific safety learning and retraining when roles change.',
    use: 'HR arranges induction; departments provide practical training. The procedure requires training content, trainee signatures and assessment records to be retained.',
    source: 'Employee Training Procedure',
    note: 'Describes required records; no attendance or completion results are presented.',
  },
  {
    id: 'inspection', number: '03', title: 'Inspection & follow-up', area: 'Workplace conditions', kind: 'Procedure + blank template',
    controls: 'Recorded premises findings, corrective action and follow-up checks.',
    use: 'The premises procedure assigns findings to the responsible department for action and rechecking. A separate blank lighting log illustrates the recording fields.',
    source: 'Premises Management Procedure; Lighting Inspection Record Form',
    note: 'The blank form contains no measured results. Historical reference values are omitted.',
  },
  {
    id: 'action', number: '04', title: 'Findings & corrective action', area: 'Internal review & incident response', kind: 'Two procedure summaries',
    controls: 'How audit findings and incidents are recorded, investigated and assigned for action.',
    use: 'The audit procedure links objective evidence to nonconformity reports, corrective plans and verification. The incident procedure specifies reporting, cause investigation and corrective or preventive measures.',
    source: 'Internal Audit Guidelines; Accident Handling Procedure',
    note: 'Two related process summaries; no completed audit, incident case or closure result is presented.',
  },
  {
    id: 'review', number: '05', title: 'Management review', area: 'Management oversight', kind: 'Procedure summary',
    controls: 'Review inputs, improvement decisions and responsibility for follow-up.',
    use: 'Audit results, complaints, significant incidents and action status feed the review. Decisions, responsible roles and planned dates are to be recorded and followed up.',
    source: 'Social Responsibility Management Review Procedure',
    note: 'Shows the review structure; no meeting minutes or completed decisions are presented.',
  },
] as const;

export const ethicalFaqs = [
  { question: 'How do the procedures address underage labor?', answer: 'Recruitment rules require age and identity checks and prohibit child labor. Separate documents address young-worker protection and child-labor remediation, including stopping the work and supporting safety, health and education. The current controlled procedure and implementation records should be reviewed for the site being qualified.' },
  { question: 'How are worker complaints handled?', answer: 'The documents provide for worker representatives, direct or written complaints, investigation and feedback. They also call for confidentiality and protection against retaliation. The active channels, responsible contacts and response arrangements should be confirmed during qualification; this page does not establish an independent hotline or a response-time guarantee.' },
  { question: 'How do the documents address workplace safety?', answer: 'The procedures cover risk assessment, machinery and energy controls, PPE, chemical handling, emergency response, workplace inspections and safety training. Incident handling includes reporting, cause investigation and corrective or preventive measures. Current conditions and execution records require site-specific review.' },
  { question: 'How are corrective actions followed up?', answer: 'Internal-audit procedures call for findings to be recorded, corrective action to be assigned and the response to be verified. The management-review procedure brings action status and other inputs into decisions with responsible roles and planned dates. These summaries do not claim that a particular finding has been closed.' },
  { question: 'Can customers review supporting documents during supplier qualification?', answer: 'Discuss the Xinyinhai factory site, review period and information needed with your project contact through LEANODM.com. Relevant supporting information may be considered for controlled sharing after a scope and confidentiality review, with an NDA where appropriate. Availability and permission to share are confirmed case by case; personnel records, customer information and security-sensitive details are not public downloads.' },
];
