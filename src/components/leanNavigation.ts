export type LeanNavigationItem = {
  label: string;
  href: string;
  secondary?: boolean;
  overview?: boolean;
};

export type LeanNavigationCardItem = LeanNavigationItem & {
  description: string;
  icon: string;
};

export type LeanNavigationMenuData = {
  title: string;
  intro: string;
  links: readonly LeanNavigationCardItem[];
  columns?: 2 | 3;
};

export const leanInquiryNavigation = {
  label: 'Start your inquiry',
  href: '/rfq/#rfq-form',
} as const;

export const inquiryHrefForPage = (pathname: string) =>
  pathname.replace(/\/$/, '') === '/rfq' ? '#rfq-form' : leanInquiryNavigation.href;

export const leanPrimaryNavigation: readonly LeanNavigationItem[] = [
  { label: 'ODM & OEM', href: '/customization/' },
  { label: 'Manufacturing', href: '/manufacturing/', overview: true },
  { label: 'Quality', href: '/quality/', overview: true },
  { label: 'About', href: '/about/', overview: true },
];

export type LeanCustomizationNavigationItem = LeanNavigationItem & (
  | { group: 'business'; description: string; icon: string }
  | { group: 'guide' }
);

export const leanCustomizationNavigation: readonly LeanCustomizationNavigationItem[] = [
  { label: 'Existing Product Customization', href: '/customization/existing-products/', group: 'business', icon: 'palette', description: 'Branding, color, finish and packaging for an existing product.' },
  { label: 'Product Adaptation', href: '/customization/product-adaptation/', group: 'business', icon: 'sliders-horizontal', description: 'Engineering changes to an existing product design.' },
  { label: 'New Product Development', href: '/customization/new-product-development/', group: 'business', icon: 'lightbulb', description: 'From a new product brief to a production-ready design.' },
  { label: 'OEM Manufacturing', href: '/customization/oem-manufacturing/', group: 'business', icon: 'factory', description: 'Manufacturing from your approved design and specifications.' },
  { label: 'How We Work', href: '/customization/how-we-work/', group: 'guide' },
  { label: 'Project Fit & Working Principles', href: '/customization/project-fit/', group: 'guide' },
];

export const leanManufacturingNavigation: readonly LeanNavigationCardItem[] = [
  { label: 'Electronics & SMT', href: '/manufacturing/electronics-smt/', icon: 'circuit-board', description: 'PCB assembly, soldering and electronic production processes.' },
  { label: 'Tooling & Injection Molding', href: '/manufacturing/tooling-injection-molding/', icon: 'blocks', description: 'Tool development, mold trials and injection-molded parts.' },
  { label: 'Screen Printing & Product Decoration', href: '/manufacturing/screen-printing/', icon: 'paintbrush', description: 'Artwork, surface preparation, printing and decoration processes.' },
  { label: 'Assembly & Packaging', href: '/manufacturing/assembly-packaging/', icon: 'package-check', description: 'Product assembly, line checks and final packaging.' },
];

export const leanAboutNavigation: readonly LeanNavigationCardItem[] = [
  { label: 'Ethical Manufacturing', href: '/about/ethical-manufacturing/', icon: 'hand-heart', description: 'Documented labor, workplace safety and business-ethics procedures.' },
  { label: 'About Us', href: '/about/', icon: 'building-2', description: 'Xinyinhai’s manufacturing background, facilities and development capabilities.' },
  { label: 'Activities & Community', href: '/about/activities/', icon: 'users', description: 'Factory activities, team learning and connections with the community.' },
];

export const leanSecondaryNavigation: readonly LeanNavigationItem[] = [
  { label: 'Case Studies', href: '/case-studies/', secondary: true },
  { label: 'Resources', href: '/resources/', secondary: true },
];

export const leanQualityNavigation: readonly LeanNavigationCardItem[] = [
  { label: 'Quality Control Process', href: '/quality/quality-control-process/', icon: 'workflow', description: 'Quality controls from incoming materials through shipment release.' },
  { label: 'Appearance Inspection', href: '/quality/appearance-inspection/', icon: 'scan-eye', description: 'Surface classes, visual defects and appearance acceptance criteria.' },
  { label: 'Incoming Inspection', href: '/quality/incoming-inspection/', icon: 'clipboard-check', description: 'Material-specific checks before parts enter the production flow.' },
  { label: 'Product Testing', href: '/quality/product-testing/', icon: 'flask-conical', description: 'Planned test methods, conditions and product evaluation criteria.' },
  { label: 'Inspector Training', href: '/quality/inspector-training/', icon: 'graduation-cap', description: 'Training references for inspection methods and defect recognition.' },
  { label: 'Traceability & Materials', href: '/quality/traceability/', icon: 'git-branch', description: 'Material identification and order, batch and delivery records.' },
];

export const leanModularNavigation: Readonly<Record<string, LeanNavigationMenuData>> = {
  Manufacturing: {
    title: 'Manufacturing capabilities',
    intro: 'Explore the processes behind your product.',
    links: leanManufacturingNavigation,
  },
  Quality: {
    title: 'Quality controls',
    intro: 'Explore inspection, testing and the records behind each decision.',
    links: leanQualityNavigation,
  },
  About: {
    title: 'About Xinyinhai',
    intro: 'Manufacturing background, people and practices.',
    links: leanAboutNavigation,
    columns: 3,
  },
};

export const leanNavigation = [
  ...leanPrimaryNavigation,
  ...leanSecondaryNavigation,
] as const;
