import type { SoundBookProduct } from './types';

export const SOUND_BOOK_BASE = '/products/custom-sound-book/';
export const soundBookStatusNotes: Record<SoundBookProduct['status'], string> = {
  'historical-reference': 'Historical reference for project discussion. Existing artwork and content are not offered for reproduction; base-design availability and tooling access need review.',
  sample: 'Sample reference for project discussion. Confirm the proposed design, content permissions and manufacturing scope before quotation.',
  'customization-concept': 'Customization concept for layout discussion. It is not an existing sample or a verified engineering or audio specification.',
};

// Only product-facing content lives here. Original-file and permission records
// stay in internal/product-sources/sound-book-catalog.json, outside public/.
export const soundBookProducts: readonly SoundBookProduct[] = [
  {
    id: 'SB-JP-10KEY', slug: 'ten-button-sound-book', name: 'Ten-Button Sound Book',
    style: 'Oval-button sound panel', theme: 'Illustrated music & stories',
    summary: 'An open-book reference with ten labeled oval controls in a sound panel below the illustrated pages. A useful starting point for discussing a defined button-to-content layout.',
    features: ['Ten visible oval controls', 'Sound panel below the pages', 'Separate large yellow control'],
    functions: ['Labeled control layout', 'Speaker and slider integration'],
    shownLanguages: ['Japanese'], status: 'historical-reference', statusLabel: 'Historical reference',
    gallery: [
      { src: '/media/sound-book/reference-open.webp', width: 956, height: 510, label: 'Open-book reference', alt: 'Open Japanese illustrated book with a turquoise ten-button panel below the pages and a large yellow control', caption: 'Archived product photograph. The controls and printed edition are visible; audio behavior is not verified by this image.' },
      { src: '/media/sound-book/reference-controls.webp', width: 455, height: 177, label: 'Control-panel detail', alt: 'Crop of the same book showing ten oval controls, speaker grille, slider and yellow side control', caption: 'Detail cropped from the same photograph, not another model or a separate angle.' },
      { src: '/media/sound-book/reference-pages.webp', width: 880, height: 306, label: 'Printed-page detail', alt: 'Crop of the same book showing Japanese text and musical-stage illustrations across the open pages', caption: 'The reference edition uses Japanese text and existing illustrations. New content needs its own rights and approval.' },
    ],
    confirmedSpecs: [
      { label: 'Format shown', value: 'Open illustrated book with a lower plastic sound panel.' },
      { label: 'Control layout visible', value: 'Ten oval labeled controls plus a larger yellow control, speaker grille and slider.' },
      { label: 'Printed edition shown', value: 'Japanese text and illustrations; this does not establish available audio languages.' },
    ],
    evaluation: [
      { label: 'Book & enclosure', text: 'Confirm book dimensions, page construction, housing material and the fit between the book and sound module.' },
      { label: 'Interaction & audio', text: 'Define the function of each control, audio duration, volume behavior and power arrangement. The photograph does not establish these specifications.' },
      { label: 'Starting design', text: 'Check the available design and tooling scope before treating this archive reference as a production baseline.' },
    ],
    customization: {
      print: ['Cover, page artwork and your brand', 'Button legends and the page-to-track map', 'Separate language editions and retail packaging'],
      audio: ['Authorized narration, songs or effects', 'Voice, pronunciation and content review', 'Programming and sample playback approval'],
      engineering: ['Button count and placement', 'Housing, fixing points and assembly', 'Power and playback functions'],
    },
    evidenceKeys: ['tooling', 'electronics', 'assembly'], relatedIds: ['SB-JP-GRID', 'SB-SPINE-MUSIC'],
    inquiryPrompts: ['Which controls and layout should stay?', 'How many tracks or content segments are needed?', 'Are you planning separate language editions?'],
    sourceKey: 'presentation-s10-image29',
  },
  {
    id: 'SB-JP-GRID', slug: 'picture-grid-nursery-rhyme-book', name: 'Picture-Grid Nursery Rhyme Book',
    style: 'Picture-selection grid', theme: 'Nursery-rhyme content',
    summary: 'A Japanese nursery-rhyme book reference with a broad picture-selection area below the cover and a separate speaker and control strip. Its layout differs from the oval-button format.',
    features: ['4 × 4 illustrated selection area', 'Wide lower control panel', 'Speaker and controls at the side'],
    functions: ['Picture-based content navigation', 'Book and control-area integration'],
    shownLanguages: ['Japanese'], status: 'historical-reference', statusLabel: 'Historical reference',
    gallery: [{ src: '/media/sound-book/reference-picture-grid.webp', width: 525, height: 700, label: 'Picture-grid reference', alt: 'Japanese nursery-rhyme book with turquoise cover and a lower four-by-four picture selection area beside the speaker and controls', caption: 'Archived product photograph. Sixteen picture areas are visible; the activation method and number of audio tracks require confirmation.' }],
    confirmedSpecs: [
      { label: 'Format shown', value: 'Printed book above a broad lower selection panel.' },
      { label: 'Layout visible', value: 'A four-by-four arrangement of picture areas with additional controls at the right.' },
      { label: 'Printed edition shown', value: 'Japanese cover and labels. The title identifies nursery-rhyme content.' },
    ],
    evaluation: [
      { label: 'Selection method', text: 'Confirm how picture areas activate playback. The photo alone does not establish a touchscreen, mechanical keys or sixteen songs.' },
      { label: 'Content mapping', text: 'Plan the illustration-to-track map, any repeat or stop controls, and how children and parents identify the content.' },
      { label: 'Construction', text: 'Review the book attachment, panel construction, controls, power and intended-age requirements for a new design.' },
    ],
    customization: {
      print: ['Picture tiles, cover and nursery-rhyme pages', 'Localized legends and instructions', 'Brand, edition identity and channel packaging'],
      audio: ['Authorized rhymes, narration and music', 'Pronunciation and recording review', 'Selection-to-track mapping and sample checks'],
      engineering: ['Selection technology and control behavior', 'Panel layout and enclosure construction', 'Speaker, power and assembly arrangement'],
    },
    evidenceKeys: ['electronics', 'incoming', 'appearance'], relatedIds: ['SB-JP-10KEY', 'SB-SPINE-MUSIC'],
    inquiryPrompts: ['Do you want a picture-grid interaction?', 'Which content belongs to each picture?', 'What activation method does your brief require?'],
    sourceKey: 'presentation-s8-image20',
  },
  {
    id: 'SB-SPINE-MUSIC', slug: 'spine-module-musical-book', name: 'Spine-Module Musical Book',
    style: 'Slim spine-side sound module', theme: 'Seasonal music & picture-book content',
    summary: 'A closed-book reference with a slim yellow sound module beside the illustrated cover. English and Japanese are visible in the printing; audio language and the playback trigger need review.',
    features: ['Slim module beside the spine', 'Speaker visible at the module top', 'English and Japanese cover printing'],
    functions: ['Compact book-and-module arrangement', 'Printed content and sound-module coordination'],
    shownLanguages: ['English', 'Japanese'], status: 'historical-reference', statusLabel: 'Historical reference',
    gallery: [{ src: '/media/sound-book/reference-spine-module.webp', width: 629, height: 524, label: 'Spine-module reference', alt: 'Closed Musical Christmas Tree picture book with English and Japanese cover text and a slim yellow sound module beside the spine', caption: 'Archived closed-book photograph. The inside pages, playback trigger and actual audio languages are not established by this view.' }],
    confirmedSpecs: [
      { label: 'Format shown', value: 'Closed illustrated book beside a slim yellow sound module.' },
      { label: 'Module details visible', value: 'Speaker grille at the top and printed control/content areas along the module.' },
      { label: 'Printed edition shown', value: 'English title and Japanese text. Printed languages do not prove bilingual audio.' },
    ],
    evaluation: [
      { label: 'Playback interaction', text: 'Define how the user triggers, stops or repeats audio. Do not infer a page-sensing or recording function from the closed cover.' },
      { label: 'Book & module fit', text: 'Review the book construction, module attachment, printed control areas and access needed for the chosen power arrangement.' },
      { label: 'Content scope', text: 'Identify authorized seasonal or other content, language editions and any need for a new enclosure or electronics.' },
    ],
    customization: {
      print: ['Cover and authorized picture-book content', 'Module labels and edition information', 'Retail pack, instructions and barcodes'],
      audio: ['Authorized music or narration', 'Language and pronunciation approval', 'Defined playback and content mapping'],
      engineering: ['Sound-module position and attachment', 'Playback trigger and controls', 'Power, housing and book construction'],
    },
    evidenceKeys: ['tooling', 'assembly', 'appearance'], relatedIds: ['SB-JP-10KEY', 'SB-JP-GRID'],
    inquiryPrompts: ['Is a slim spine-side format important?', 'How should playback be triggered?', 'Which printed and audio languages are required?'],
    sourceKey: 'presentation-s8-image16',
  },
];

export const soundBookPath = (product: Pick<SoundBookProduct, 'slug'>) => `${SOUND_BOOK_BASE}${product.slug}/`;
export const findSoundBook = (id: string) => soundBookProducts.find(product => product.id === id);
export const relatedSoundBooks = (product: SoundBookProduct) => product.relatedIds.map(findSoundBook).filter((item): item is SoundBookProduct => Boolean(item));
export const inquiryProducts = soundBookProducts.map(product => ({ id: product.id, name: product.name, path: soundBookPath(product), shownLanguages: product.shownLanguages }));
