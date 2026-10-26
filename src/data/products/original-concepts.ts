import { SITE } from '../../config/site';
import additionalConcepts from './original-concept-catalog.json';

export interface OriginalConcept {
  id: string; slug: string; name: string; shortName: string;
  path: string; canonical: string; categoryPath: string;
  title: string; description: string; summary: string;
  status: string; stageSummary: string; statusDetail: string;
  revision: string; reviewedOn: string; image: string; imageAlt: string; rfqHref: string;
  imageWidth?: number; imageHeight?: number;
  introHeading: string; intro: string; formHeading: string; formDescription: string;
  playSteps: { title: string; description: string }[];
  proposedInputs: string[][];
  discussionHeading: string; discussionDescription: string; discussionOptions: string[];
  developmentSteps: { title: string; description: string }[];
  closingHeading: string; closingDescription: string;
  gallery: { src: string; alt: string; caption: string }[];
  faqs: { question: string; answer: string }[];
}

export const ORIGINAL_CONCEPTS_SLUG = 'original-product-concepts';
export const ORIGINAL_CONCEPTS_PATH = '/products/plastic-electronic-toys/original-product-concepts/';
export const conceptCollection = {
  name: 'Original Product Concepts',
  description: 'Original play, learning, observation and audio product ideas for customer review and possible co-development. Digital concepts only: no physical prototypes, mould tooling, custom PCBs or physical validation have been completed.',
  status: 'Digital concepts · Not physically validated',
};

const path = `${ORIGINAL_CONCEPTS_PATH}say-island-picture-guessing-game-concept/`;
const canonical = new URL(path, SITE.url).href;
const brief = 'We would like to discuss the Say Island digital concept. We understand that no physical prototype, mould tooling, custom PCB or physical validation has been completed. Please help us review our target market, audience, picture content and languages, intended changes, feasibility, prototype scope, budget and next development steps.';
const query = new URLSearchParams({ projectType: 'new-product-development', source: 'original-product-concept', product: 'Say Island Tabletop Picture Guessing Game Concept', reference: canonical, details: brief });

export const sayIslandConcept: OriginalConcept = {
  id: 'say-island-r01',
  slug: 'say-island-picture-guessing-game-concept',
  name: 'Say Island Tabletop Picture Guessing Game Concept',
  shortName: 'Say Island',
  path,
  canonical,
  categoryPath: ORIGINAL_CONCEPTS_PATH,
  title: 'Say Island Picture Guessing Game Concept | LEANODM',
  description: 'Explore Say Island, an offline tabletop picture guessing game concept for OEM/ODM discussion. Digital design only; no tooling, custom PCB or physical testing.',
  summary: 'A proposed offline tabletop game with picture prompts, spoken clues and two-button control. An original digital concept for customer review and development discussion.',
  status: 'Digital concept only',
  stageSummary: 'Digital concept · Not physically validated',
  statusDetail: 'No physical prototype, mould tooling, custom PCB or physical validation has been completed. The images show digital concept models, not an existing physical product. Presented for customer selection, reference and possible co-development; not production-ready.',
  revision: 'Concept R01',
  reviewedOn: '2026-10-24',
  image: '/images/products/original-concepts/say-island/say-island-tabletop-concept.png',
  imageAlt: 'Digital concept rendering of Say Island, a tabletop picture guessing game with a single-facing screen and two buttons. Not a physical prototype.',
  rfqHref: `/rfq/?${query.toString()}#rfq-form`,
  introHeading: 'Picture guessing, face to face.',
  intro: 'A picture-led tabletop play concept for spoken clues, gestures and shared turns. A single-facing display and two physical buttons are proposed to keep attention on the people playing.',
  playSteps: [
    { title: 'Look at the picture', description: 'The clue-giving player views a picture on the single-facing screen. The guessing player sits on the opaque-back side.' },
    { title: 'Give a clue', description: 'Players use words or gestures to describe the picture without revealing its name. The game is intended for face-to-face participation.' },
    { title: 'Let the players judge', description: 'Another player guesses. People decide whether the answer is correct; the proposed device does not recognise speech or judge answers.' },
    { title: 'Mark it and take turns', description: 'Two buttons are proposed for correct or skip, followed by a new picture. A relaxed practice mode and optional timed rounds are design directions.' },
  ],
  formHeading: 'A tabletop form for shared play',
  formDescription: 'The proposed fixed wedge places the picture screen above a lower two-button area. Side wings are intended to reduce oblique viewing, while an opaque back separates the prompt from the guessing player. Seating, visibility, hand access, stability and internal fit still need physical evaluation.',
  discussionHeading: 'A starting point for your product brief',
  discussionDescription: 'Select this direction as a reference, then define what your customers need. These are possible development discussions, not a confirmed menu of ready-made options.',
  discussionOptions: [
    'Target audience, play rules and sales market',
    'Original picture content, difficulty and languages',
    'Visual identity, colours and surface finishes',
    'Product proportions, screen and button arrangement',
    'Power approach and electronic architecture',
    'Prototype scope, target cost and validation plan',
  ],
  developmentSteps: [
    { title: 'Agree the brief', description: 'Define the audience, market, play experience, content, intended changes and commercial constraints.' },
    { title: 'Check the experience', description: 'Compare paper or screen mock-ups and a full-size form model before committing to custom electronics or tooling.' },
    { title: 'Evaluate feasibility', description: 'Select real components and assess an electronic proof of concept, structure, power, usability and market-specific safety requirements.' },
    { title: 'Decide whether to develop', description: 'Agree project scope, ownership, budget and validation responsibilities. Tooling, custom PCBs and production assessment would be later decisions.' },
  ],
  closingHeading: 'Would this direction fit your product range?',
  closingDescription: 'Tell us your target market, audience and intended changes. Start with a concept review and a development brief, rather than an order for an existing product.',
  gallery: [
    { src: '/images/products/original-concepts/say-island/say-island-front-concept.png', alt: 'Front view of the Say Island digital concept, with picture screen and two proposed buttons.', caption: 'Front · Proposed picture display and two-button layout' },
    { src: '/images/products/original-concepts/say-island/say-island-side-concept.png', alt: 'Side view of the Say Island digital concept showing its proposed wedge-shaped tabletop body.', caption: 'Side · Proposed fixed tabletop posture' },
    { src: '/images/products/original-concepts/say-island/say-island-rear-concept.png', alt: 'Rear view of the Say Island digital concept with an opaque back facing the guessing player.', caption: 'Rear · Opaque side facing the guessing player' },
  ],
  proposedInputs: [
    ['Play format', 'Face-to-face picture guessing; players judge answers'],
    ['Display direction', 'Single-facing, landscape colour picture screen; 2.8-inch starting point'],
    ['Controls', 'Two physical buttons for skip/correct and menu selection'],
    ['Operation', 'Offline; no app or cloud service proposed'],
    ['Audio direction', 'Optional state cues and rule prompts; no announcement of the current answer'],
    ['Power direction', 'Replaceable 3-AA arrangement proposed; not physically verified'],
    ['Digital design envelope', 'Approximately 180 W × 112 H × 92 D mm; a design starting point'],
    ['Audience', 'Exploratory family / young-learner direction; final age grading not established'],
    ['Development stage', 'Digital concept; no physical validation'],
  ],
  faqs: [
    { question: 'Is Say Island ready to order?', answer: 'No. Say Island is an original digital product concept for customer review and possible development. It is not an available, tested or production-ready toy.' },
    { question: 'Do the images show a physical prototype?', answer: 'No. All product views on this page are digital concept renderings. No physical prototype, mould tooling, custom PCB or physical validation has been completed.' },
    { question: 'Does the proposed game use AI or speech recognition?', answer: 'The proposed offline route uses human judgement and two buttons. No microphone, camera, wireless connection or automatic answer scoring is proposed.' },
    { question: 'What age group is it suitable for?', answer: 'The initial idea explores family play with young learners. Final age grading, content suitability and applicable safety requirements have not been established and need evaluation.' },
    { question: 'Can this concept be adapted for our brand?', answer: 'Branding, picture content, languages, appearance and other requirements can be discussed in a development brief. Feasibility, ownership, project scope, cost and validation would need agreement before development.' },
    { question: 'What are the price, MOQ and lead time?', answer: 'They have not been set. A meaningful quotation requires an agreed specification, feasibility review, prototype scope and supplier assessment.' },
  ],
};

function completeConcept(item: Omit<OriginalConcept, 'path' | 'canonical' | 'categoryPath' | 'rfqHref'>): OriginalConcept {
  const path = `${ORIGINAL_CONCEPTS_PATH}${item.slug}/`;
  const canonical = new URL(path, SITE.url).href;
  const details = `We would like to discuss the ${item.shortName} digital concept. We understand that no physical prototype, mould tooling, custom PCB or physical validation has been completed. Please help us review our target market, audience, intended changes, feasibility, prototype scope, budget and next development steps.`;
  const query = new URLSearchParams({ projectType: 'new-product-development', source: 'original-product-concept', product: item.name, reference: canonical, details });
  return { ...item, path, canonical, categoryPath: ORIGINAL_CONCEPTS_PATH, rfqHref: `/rfq/?${query.toString()}#rfq-form` };
}

export const originalConcepts: OriginalConcept[] = [sayIslandConcept, ...additionalConcepts.map(completeConcept)];
export const originalConceptPaths = originalConcepts.map(concept => concept.path);

export function conceptsForCatalog(pathname: string) {
  return ['/products/', '/products/plastic-electronic-toys/', ORIGINAL_CONCEPTS_PATH].includes(pathname) ? originalConcepts : [];
}
