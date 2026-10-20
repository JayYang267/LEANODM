import type { SoundBookCategoryData } from './types';
// Shared category content; individual style facts live only in the catalog.
export const soundBookCategory = {
  name: 'Custom Sound Books',
  path: '/products/custom-sound-book/',
  title: 'Custom Sound Books | Formats, Languages & OEM / ODM | LEANODM',
  description: 'Browse sound book formats, compare historical product references and explore printed and audio language customization with Xinyinhai development and manufacturing support.',
  intro: 'Find a format that fits your content, then shape the printed edition, audio and interaction around your project.',
  customization: [
    { id: 'artwork', label: 'Brand & cover artwork', short: 'Cover, illustrations and logo placement.', note: 'Provide authorized artwork and a print-ready file or identify the design work needed. Approve color, placement and printed proofs.', marker: '01' },
    { id: 'pages', label: 'Book content & languages', short: 'Themes, page structure and language editions.', note: 'Define the book format, page count and languages. Changes to page construction or binding need a fresh sample and supplier review.', marker: '02' },
    { id: 'audio', label: 'Audio & voice content', short: 'Songs, narration and button-to-track mapping.', note: 'Confirm scripts, recording rights, audio duration, file format and sound quality. Content changes can require programming and a new functional sample.', marker: '03' },
    { id: 'buttons', label: 'Sound buttons & interaction', short: 'Button count, layout and playback behavior.', note: 'A new layout or interaction can affect the PCB, firmware, housing and tooling. Engineering, sample and test costs need evaluation.', marker: '04' },
    { id: 'housing', label: 'Plastic housing & color', short: 'Enclosure shape, molded parts and finish.', note: 'Define the material grade, approved color and appearance limits, finish, fit and fixing points. Review print adhesion and wear where relevant. A new enclosure or structural change may require tooling work and a fresh sample.', marker: '05' },
    { id: 'power', label: 'Power configuration', short: 'Power source, access and operating controls.', note: 'Confirm the power preference and intended users. Battery access, component fit and applicable testing must be reviewed for the final design.', marker: '06' },
    { id: 'packaging', label: 'Packaging & retail information', short: 'Box, instructions, labels and barcodes.', note: 'Define pack contents, authorized artwork, language versions, retail labels and shipping protection. Approve a representative pack sample.', marker: '07' },
  ],
  pathways: [
    { value: 'existing-products', label: 'Customize a suitable base', kicker: '01 / EXISTING DESIGN', text: 'Start by checking a suitable, available design. Review branding, authorized content, color and packaging within its supported configuration.', cost: 'Artwork, audio preparation, programming and custom samples may still carry costs. The pictured reference is not a confirmed available base.' },
    { value: 'product-adaptation', label: 'Adapt structure or function', kicker: '02 / PRODUCT ADAPTATION', text: 'Change the button arrangement, enclosure or playback behavior. Review how the book, electronics and plastic components fit together.', cost: 'Allow for engineering, revised samples, validation and any tooling changes. Confirm their scope and fees before work starts.' },
    { value: 'new-product-development', label: 'Develop a new sound book', kicker: '03 / NEW ODM DEVELOPMENT', text: 'Build a new concept around your content and interaction goals. Define the book construction, electronics, housing and manufacturing responsibilities.', cost: 'The project may require design, prototypes, electronics, tooling and external testing. Deliverables and milestones belong in the agreed quotation.' },
  ],
} as const satisfies SoundBookCategoryData;
