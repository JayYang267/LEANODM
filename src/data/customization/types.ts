export interface CustomizationPageData {
  slug: string;
  title: string;
  description: string;
  h1: string;
  navTitle: string;
  eyebrow: string;
  lead: string;
  intro: string;
  summary: { label: string; text: string }[];
  highlights: string[];
  sections: { label: string; href: string }[];
  faqs: { question: string; answer: string }[];
  cta: string;
  briefIntro: string;
  needs: string[];
  receives: string[];
  related: { href: string; label: string; description: string }[];
  serviceType?: string;
}
