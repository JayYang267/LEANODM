import type { ImageMetadata } from 'astro';
export interface ProductManufacturingData {
  name: string; heading: string; path: string; title: string; description: string;
  eyebrow: string; intro: string; status: string; statusText: string;
  gallery: readonly { src: string; width: number; height: number; label: string; alt: string; caption: string }[];
  terms: readonly { title: string; text: string }[];
  customization: readonly { id: string; label: string; short: string; note: string; marker: string }[];
  pathways: readonly { value: string; label: string; kicker: string; text: string; cost: string }[];
  specifications: readonly { group: string; rows: readonly (readonly [string, string])[] }[];
}
export interface ProductManufacturingSupport {
  capabilities: readonly { id: string; title: string; meaning: string; basis: string; href: string; image: ImageMetadata | string; imageFit?: string; alt: string }[];
  capabilityNote: string; qualityNote: string;
  qualityChecks: readonly { title: string; text: string }[];
  deliverySteps: readonly { title: string; text: string; output: string }[];
  commercialDetails: readonly { title: string; text: string }[];
  faqs: readonly { question: string; answer: string }[];
  faqGroups: readonly { id: string; title: string; intro: string; items: readonly { question: string; answer: string }[] }[];
  learningChecks: readonly { title: string; text: string }[];
  procurementRows: readonly { topic: string; decision: string; review: string }[];
  marketReviews: readonly { market: string; text: string }[];
  reviewDocuments: readonly { title: string; text: string }[];
}

export interface SoundBookImage {
  src: string; width: number; height: number; label: string; alt: string; caption: string;
}
export interface SoundBookProduct {
  id: string; slug: string; name: string; style: string; theme: string;
  summary: string; features: readonly string[]; functions: readonly string[];
  shownLanguages: readonly string[];
  status: 'historical-reference' | 'sample' | 'customization-concept'; statusLabel: string;
  gallery: readonly SoundBookImage[];
  confirmedSpecs: readonly { label: string; value: string }[];
  evaluation: readonly { label: string; text: string }[];
  customization: { print: readonly string[]; audio: readonly string[]; engineering: readonly string[] };
  evidenceKeys: readonly string[]; relatedIds: readonly string[];
  inquiryPrompts: readonly string[];
  sourceKey: string;
}
export interface SoundBookCategoryData {
  name: string; path: string; title: string; description: string; intro: string;
  customization: ProductManufacturingData['customization'];
  pathways: ProductManufacturingData['pathways'];
}
