import { leanInquiryNavigation } from '../components/leanNavigation';
import { resolveCanonicalOrigin } from './seo';

// Site configuration
export const SITE = {
  title: 'LEANODM.com',
  description: 'LEANODM.com presents Xinyinhai’s product development and manufacturing capabilities for plastic and electronic OEM/ODM projects.',
  url: resolveCanonicalOrigin(import.meta.env.PUBLIC_SITE_URL),
} as const;

export const NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: leanInquiryNavigation.label, href: leanInquiryNavigation.href },
] as const;

// No public social accounts have been confirmed for this website.
export const SOCIAL_LINKS = {} as const;
