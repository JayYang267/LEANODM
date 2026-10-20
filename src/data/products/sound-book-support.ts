import moldCare from '../../assets/about/xinyinhai-molding-aisle.webp';
import boardInspection from '../../assets/home/xinyinhai-smt.jpeg';
import assemblyPositioning from '../../assets/home/xinyinhai-assembly.png';

// Reuse only evidence already published on the corresponding capability pages.
// These references do not establish a completed Sound Book production project.
export const capabilityNote = 'Xinyinhai’s factory photographs and published standards show the relevant manufacturing methods. These examples concern general processes and other products; your sound book needs its own approved design and inspection plan.';

export const capabilities = [
  {
    id: 'tooling',
    title: 'Tooling & plastic parts',
    meaning: 'Develop the sound-module housing, button openings and fixing points as parts that can be molded and assembled.',
    basis: 'Xinyinhai’s in-house toolroom supports machining and repair. Joint mold reviews, trial feedback and first-article checks connect tooling decisions to molded-part fit.',
    href: '/manufacturing/tooling-injection-molding/#mold-preparation',
    image: moldCare,
    alt: 'Injection molding machines along an aisle in Xinyinhai’s workshop',
  },
  {
    id: 'electronics',
    title: 'Electronics & SMT',
    meaning: 'Connect the playback board, button inputs, speaker and power arrangement to the housing and finished-product checks.',
    basis: 'Xinyinhai provides electronics development and SMT assembly. Published workshop routes include print checks, pre-oven QC and AOI on the specified board routes.',
    href: '/manufacturing/electronics-smt/#integration',
    image: boardInspection,
    alt: 'Assembly equipment and an operator in Xinyinhai’s SMT workshop',
  },
  {
    id: 'assembly',
    title: 'Assembly & packaging',
    meaning: 'Turn the component set into a defined fitting, fastening, wiring, inspection and packing sequence.',
    basis: 'Assembly instructions show component positioning and sample comparison. Production boards add setup, first-piece confirmation, line checks and quality verification before packing.',
    href: '/manufacturing/assembly-packaging/#assembly-process',
    image: assemblyPositioning,
    alt: 'Workstations and parts bins in Xinyinhai’s assembly workshop',
  },
  {
    id: 'incoming',
    title: 'Incoming component checks',
    meaning: 'Set acceptance checks for the supplied board and other parts before they reach sound-book assembly.',
    basis: 'The published IQC standard includes PCBA appearance, function, current and solderability checks. Product-specific electrical limits and the applicable instruction must be supplied for the new design.',
    href: '/quality/incoming-inspection/#source-evidence',
    image: '/images/quality/incoming-inspection/evidence-electronics.webp',
    imageFit: 'contain',
    alt: 'Original IQC standard table excerpt covering PCBA appearance, function, currents and solderability',
  },
  {
    id: 'appearance',
    title: 'Appearance acceptance',
    meaning: 'Make housing joints, visible molding defects and printed-detail acceptance consistent between the sample and inspection.',
    basis: 'The published appearance standard defines surface classes and defect criteria. Its original photographs illustrate housing gaps, surface steps, scratches and incomplete printing on other products.',
    href: '/quality/appearance-inspection/#defect-library',
    image: '/images/quality/appearance-inspection/surface-step-mismatch.webp',
    alt: 'A red oval marks a surface step at the joint of a yellow plastic housing in the appearance standard',
  },
] as const;

export const qualityNote = 'These checks form a proposed plan for your sound book. The published test plan includes sound, button, book-opening and bonding checks; it supplies no completed results for this configuration. Select the methods, limits and external testing for the intended users and market.';

export const qualityChecks = [
  {
    title: 'Artwork & audio versions',
    text: 'Match the approved artwork, language, audio files, button-to-track map and playback firmware revision. Define how those versions connect to production and lot records.',
  },
  {
    title: 'Materials & components',
    text: 'Identify material grades, approved sources, color and appearance references, and any recycled-material limits. Define incoming checks for printed parts, plastics, boards, speakers and the power configuration.',
  },
  {
    title: 'First article & fit',
    text: 'Confirm page and binding alignment, housing fit, button feel, fixing points and appearance limits. Specify relevant print adhesion, wear and structural checks with their acceptance conditions.',
  },
  {
    title: 'Playback & operation',
    text: 'Check each button against its assigned audio and language. Set playback clarity, sound level, response and power-operation test methods and limits for the agreed configuration.',
  },
  {
    title: 'Safety & durability',
    text: 'Start with intended age and foreseeable misuse. Review small parts, accessible edges, trapping points, sound output, battery access and handling; define the necessary validation before production.',
  },
  {
    title: 'Final inspection & packing',
    text: 'Agree defect classes, sampling, functional checks, labels and packing. Define lot identification and retained records; isolate rejected goods and agree correction, reinspection and release decisions.',
  },
] as const;

export const deliverySteps = [
  {
    title: 'Define the brief',
    text: 'Define the users, market, content, functions and starting quantity. Mark the open decisions.',
    output: 'Reviewed requirements and open decisions',
  },
  {
    title: 'Review the design',
    text: 'Connect the book, controls, electronics and housing to a defined development and supply scope.',
    output: 'Itemized scope, quotation and milestone plan',
  },
  {
    title: 'Develop & review samples',
    text: 'Use the agreed samples to check content, audio mapping, fit and function. Record revisions.',
    output: 'Purpose-specific samples and recorded revisions',
  },
  {
    title: 'Pilot & production release',
    text: 'Review any required pilot findings, final files and acceptance criteria before authorizing mass production.',
    output: 'Pilot review and agreed production release basis',
  },
  {
    title: 'Mass production & delivery',
    text: 'Follow the agreed checks, record lot acceptance and prepare the specified packing and delivery information.',
    output: 'Accepted goods and agreed delivery records',
  },
] as const;

export { commercialDetails } from './procurement-common';

export { faqGroups, faqs, learningChecks, procurementRows, marketReviews, reviewDocuments } from './sound-book-procurement';
