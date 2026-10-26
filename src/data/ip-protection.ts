export const ipOverviewPath = '/customization/ip-protection/';
export const confidentialInquiryHref = '/rfq/?nda=1#rfq-form';
export const ownershipPrinciple = 'Development ownership is confirmed as the customer directs. For joint development, once the agreed one-time development fee is paid in full, the project development results belong to the customer or the rights holder designated by the customer.';
export const permittedUsePrinciple = 'Customer information, designs, samples and development results are not reused for other customers, resold, licensed, disclosed, publicly displayed or used in publicity without the customer’s written authorization.';

export type IPPageKey = 'overview' | 'confidentiality' | 'ownership' | 'samples' | 'programming' | 'start';
export type IPPage = {
  path: string; label: string; title: string; description: string;
  lead: string; intro: string; diagram: [string, string, string];
  diagramNote: string; sections: { label: string; href: string }[];
  faqs: { question: string; answer: string }[];
  related: IPPageKey[];
};

export const ipPages: Record<IPPageKey, IPPage> = {
  overview: {
    path: ipOverviewPath, label: 'Overview', title: 'IP Protection for OEM & ODM Projects',
    description: 'Explore how project information, design rights, samples, tooling and firmware are protected throughout OEM and ODM development and manufacturing.',
    lead: 'Protect the idea, the work and the physical product throughout your project.',
    intro: 'Xinyinhai applies an established IP and confidentiality management framework across development and manufacturing. Protection covers the people, information, physical items and approved outside parties involved in your project.',
    diagram: ['Customer inputs', 'Approved project access', 'Agreed handover'],
    diagramNote: 'A connected control system, from first discussion to project closure. Schematic only.',
    sections: [{ label: 'What we protect', href: '#protected-assets' }, { label: 'Project stages', href: '#project-stages' }, { label: 'Explore protection', href: '#protection-details' }],
    faqs: [
      { question: 'What is covered by project confidentiality?', answer: 'Ideas, industrial and mechanical designs, drawings, electronic files, firmware, content, samples, tooling and commercial information are covered. Access and handling requirements are defined for the people and approved outside parties involved.' },
      { question: 'Who owns the development results?', answer: ownershipPrinciple + ' The deliverables, file formats and handover arrangements are confirmed in the project scope.' },
      { question: 'Can our project or product be shown to another customer?', answer: 'No customer information, designs, samples or development results are used for other customers, resale, licensing, public display or publicity without the customer’s written authorization.' },
      { question: 'Can we discuss an NDA before providing drawings?', answer: 'Yes. Begin with a non-sensitive project overview and tell us that you want to discuss an NDA. Your own NDA can be used as a basis for negotiation. Detailed materials follow the agreed confidentiality and transfer arrangements.' },
    ], related: ['confidentiality', 'ownership', 'start'],
  },
  confidentiality: {
    path: ipOverviewPath + 'confidentiality/', label: 'Confidentiality', title: 'Project Confidentiality & Information Control',
    description: 'Understand need-to-know project access, controlled documents, employee and supplier confidentiality, and incident response in OEM and ODM projects.',
    lead: 'Give each person the information needed for the agreed work.',
    intro: 'Project confidentiality covers the development, production, quality and project personnel who actually participate, together with approved outside parties. Role-based access, controlled distribution and traceable changes keep information tied to its purpose.',
    diagram: ['Controlled information', 'Role-based permission', 'Authorized task'],
    diagramNote: 'Access follows the task and approved project role. Schematic only; no internal security configuration is shown.',
    sections: [{ label: 'Access by role', href: '#access-control' }, { label: 'Information handling', href: '#information-handling' }, { label: 'Incident response', href: '#incident-response' }],
    faqs: [
      { question: 'Does everyone at the factory see the complete project?', answer: 'No. Access is authorized according to work needs. Development, production, quality, project management and approved outside parties receive the information relevant to their assigned tasks rather than unrestricted project access.' },
      { question: 'How are obsolete files and engineering changes handled?', answer: 'Files are identified by project and version. Approved revisions are distributed to the relevant roles, and superseded working copies are withdrawn or clearly controlled so they are not used as the production baseline.' },
      { question: 'Can a supplier receive our complete design package?', answer: 'Only approved outside parties receive the information required for their authorized work, under confidentiality requirements. The release scope and recipient are checked; broader sharing requires authorization.' },
      { question: 'What happens when someone changes roles or a concern is discovered?', answer: 'Permissions are reviewed and adjusted when responsibilities change or access is no longer needed. Concerns are reported, contained and investigated; affected customers are notified as appropriate to the confirmed facts and agreed obligations, with corrective actions and closure records.' },
    ], related: ['samples', 'programming', 'start'],
  },
  ownership: {
    path: ipOverviewPath + 'design-ownership/', label: 'Design Rights', title: 'Design Ownership & Development Rights',
    description: 'Confirm customer-designated development ownership, one-time development fees, background IP, third-party licenses and the agreed technical handover.',
    lead: 'Define who owns the work and exactly what will be handed over.',
    intro: 'Ownership is confirmed as the customer directs. The project agreement distinguishes existing customer IP, new development results and any third-party licensed content, then identifies the deliverables and handover responsibilities.',
    diagram: ['Existing customer IP', 'Project development', 'Customer-designated owner'],
    diagramNote: 'Ownership, licensing and deliverable scope are confirmed for the project. Schematic only.',
    sections: [{ label: 'Ownership rules', href: '#rights-boundary' }, { label: 'Deliverables', href: '#handover-scope' }, { label: 'Written authorization', href: '#written-authorization' }],
    faqs: [
      { question: 'Who receives ownership in a jointly developed project?', answer: ownershipPrinciple },
      { question: 'Does the development fee automatically define every file we receive?', answer: 'The agreed one-time development fee and the technical handover are documented together. Confirm the deliverable list, native or exchange formats, agreed source files, tooling and technical documents, timing and responsible contacts before work begins.' },
      { question: 'What happens to our existing IP and third-party content?', answer: 'Your existing IP remains yours and is used only within the authorized project scope. Third-party software, content or components are identified and their license terms confirmed in advance; they are not represented as newly created customer-owned IP.' },
      { question: 'Can the design be reused or included in factory marketing?', answer: 'Customer designs and project results are not reused, disclosed, resold, licensed or publicly displayed without the customer’s written authorization. This also applies to photos, samples, packaging and publicity.' },
    ], related: ['confidentiality', 'samples', 'start'],
  },
  samples: {
    path: ipOverviewPath + 'samples-tooling/', label: 'Samples & Tooling', title: 'Sample & Tooling Protection',
    description: 'Follow the controlled lifecycle of project samples and tooling: approval, identification, custody, issue, return, reconciliation and disposal.',
    lead: 'Keep every sensitive physical item connected to a project and a responsible person.',
    intro: 'Molds, prototypes, trial parts and samples carry design information as surely as drawings do. Project separation, identification, custody and transfer records keep those items controlled during development, production and closure.',
    diagram: ['Identified physical item', 'Recorded custody', 'Reconciled destination'],
    diagramNote: 'The control continues through returns, retained items and approved destruction. Schematic only.',
    sections: [{ label: 'Custody flow', href: '#custody-flow' }, { label: 'Movement record', href: '#custody-record' }, { label: 'Reconcile & close', href: '#reconciliation' }],
    faqs: [
      { question: 'Are prototypes and defective items controlled as well as finished samples?', answer: 'Yes. Tooling, prototypes, mold-trial parts, samples, sensitive components, packaging, surplus materials and defective items remain within project controls. A defect or the end of a project does not remove the confidentiality requirement.' },
      { question: 'How do you distinguish different customers’ items?', answer: 'Items are identified by project and item reference, assigned to a custodian and held in designated storage. Issue, outside transfer, return and final disposition are recorded so quantities and destinations can be traced.' },
      { question: 'Can a tool or sample be sent to an outside party?', answer: 'An outside transfer requires approval, a defined purpose, an authorized recipient and applicable confidentiality requirements. The transfer and expected return or agreed disposition are recorded and reconciled.' },
      { question: 'What happens at the end of the project?', answer: 'Quantities and outstanding movements are checked. Return, controlled retention, scrap and destruction follow the agreed authorization and are recorded. Records identify the final destination or disposal so sensitive items do not become uncontrolled surplus.' },
    ], related: ['ownership', 'confidentiality', 'start'],
  },
  programming: {
    path: '/manufacturing/secure-programming/', label: 'Secure Programming', title: 'Secure Programming & Firmware Protection',
    description: 'Explore encrypted firmware installation, key management, chip read protection and authorized programming quantity controls for OEM and ODM production.',
    lead: 'Control the firmware release, the programming access and the authorized quantity.',
    intro: 'Xinyinhai has practical project experience with encrypted firmware programming, key management, chip read protection and authorized programming quantity control. The protection configuration is determined by the project’s chip, toolchain and product architecture.',
    diagram: ['Approved firmware release', 'Controlled programming', 'Quantity reconciliation'],
    diagramNote: 'A production control schematic, not a universal chip configuration or a claim of unbreakable protection.',
    sections: [{ label: 'Four protection controls', href: '#protection-controls' }, { label: 'Release workflow', href: '#programming-flow' }, { label: 'Changes & rework', href: '#exceptions' }],
    faqs: [
      { question: 'Do all chips support the same protection settings?', answer: 'No. Encryption, read protection, debug restrictions, provisioning and quantity-control mechanisms depend on the selected chip, toolchain and product architecture. The project plan confirms the supported configuration, validation and implications for rework and updates.' },
      { question: 'Will production personnel need access to source code or keys?', answer: 'Manufacturing access is limited to the agreed task and protection setup. Source code, production firmware and encrypted packages are handled separately and delivered as the project requires; access to keys and sensitive files is restricted to authorized roles.' },
      { question: 'How are failed programming attempts and repairs counted?', answer: 'The project rules define what counts as an attempt, successful unit and authorized retry. Failed attempts, reprogramming and repair are recorded and reconciled against the approved quantity; additional authorization is obtained when required.' },
      { question: 'Can firmware be updated or the production quantity increased?', answer: 'Yes, through a controlled change. The firmware version, protection settings, update or repair route and additional quantity are reviewed and approved, verified as appropriate, and recorded before the changed run is released.' },
    ], related: ['confidentiality', 'ownership', 'start'],
  },
  start: {
    path: ipOverviewPath + 'nda-project-start/', label: 'NDA & Project Start', title: 'Start a Confidential ODM Project',
    description: 'Start with a non-sensitive product overview, discuss your NDA, agree controlled information exchange and confirm development scope, fees and ownership.',
    lead: 'Start the conversation before sharing the sensitive detail.',
    intro: 'Tell us what you want to develop in a non-sensitive overview. We can discuss your own NDA, agree how information will be exchanged and confirm the project terms before detailed work begins.',
    diagram: ['Non-sensitive overview', 'Mutually confirmed NDA', 'Agreed project start'],
    diagramNote: 'This page explains the process. An NDA is negotiated and signed separately through a mutually confirmed process.',
    sections: [{ label: 'NDA signing', href: '#nda-signing' }, { label: 'Four steps', href: '#confidential-start' }, { label: 'What to share', href: '#first-inquiry' }, { label: 'Agree the scope', href: '#project-agreement' }],
    faqs: [
      { question: 'Can we use our company’s NDA?', answer: 'Yes. Your NDA can be used as the basis for discussion. Both sides confirm the terms, the appropriate parties and the signing process before execution.' },
      { question: 'Does clicking a button or sending an inquiry sign an NDA?', answer: 'No. This page and the RFQ form describe and initiate a discussion. An NDA is separately agreed and signed through a mutually confirmed process; checking the NDA option is a request to discuss it.' },
      { question: 'What can we share in the first inquiry?', answer: 'Share a non-sensitive summary of the product category, intended use, development stage, general functions, target market, approximate quantity and timing if known. Hold detailed drawings, source code, production firmware, keys and restricted commercial files until the exchange arrangements are confirmed.' },
      { question: 'When are fees, ownership and handover agreed?', answer: 'They are confirmed in the project scope before the agreed work starts. Development ownership follows the customer’s designation. For joint development, once the agreed one-time development fee is paid in full, the results belong to the customer or the customer-designated rights holder. The handover list, formats and arrangements are also confirmed.' },
    ], related: ['ownership', 'confidentiality', 'overview'],
  },
};

export const ipPageOrder: IPPageKey[] = ['overview', 'confidentiality', 'ownership', 'samples', 'programming', 'start'];
