export type LeanNavigationItem = {
  label: string;
  href: string;
  secondary?: boolean;
};

export const leanPrimaryNavigation: readonly LeanNavigationItem[] = [
  { label: 'Products', href: '/products/' },
  { label: 'ODM & OEM', href: '/odm-oem/' },
  { label: 'Manufacturing', href: '/manufacturing/' },
  { label: 'Quality', href: '/quality/' },
  { label: 'Lean Manufacturing', href: '/lean-manufacturing/' },
  { label: 'About', href: '/about/' },
];

export const leanSecondaryNavigation: readonly LeanNavigationItem[] = [
  { label: 'Case Studies', href: '/case-studies/', secondary: true },
  { label: 'Resources', href: '/resources/', secondary: true },
  { label: 'Contact', href: '/contact/', secondary: true },
];

export const leanNavigation = [
  ...leanPrimaryNavigation,
  ...leanSecondaryNavigation,
] as const;
