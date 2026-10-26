import * as Dialog from '@radix-ui/react-dialog';
import Icon from 'astro-iconset/react';
import { NAVIGATION } from '../../config/site';
import { leanManufacturingNavigation, leanCustomizationNavigation, leanQualityNavigation, leanAboutNavigation, leanInquiryNavigation } from '../leanNavigation';

export default function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="2xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Icon name="lucide:menu" className="h-6 w-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 2xl:hidden" />
        <Dialog.Content className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 2xl:hidden max-h-[85vh] overflow-y-auto">
          <Dialog.Title className="sr-only">Navigation Menu</Dialog.Title>
          <Dialog.Description className="sr-only">Main navigation menu</Dialog.Description>
          <div className="container mx-auto px-4 py-6 space-y-2">
            {NAVIGATION.filter(item => item.href !== leanInquiryNavigation.href).map((item) => (
              <Dialog.Close asChild key={item.href}>
                <a
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                >
                  {item.name}
                </a>
              </Dialog.Close>
            ))}
            <div aria-label="ODM & OEM pages" className="border-t border-slate-200 pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">ODM &amp; OEM</p>
              {leanCustomizationNavigation.map(item => <Dialog.Close asChild key={item.href}><a href={item.href} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-primary-50">{item.label}</a></Dialog.Close>)}
            </div>
            <div aria-label="Capabilities pages" className="border-t border-slate-200 pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Capabilities</p>
              {leanManufacturingNavigation.map(item => <Dialog.Close asChild key={item.href}><a href={item.href} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-primary-50">{item.label}</a></Dialog.Close>)}
            </div>
            <div aria-label="Quality pages" className="border-t border-slate-200 pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Quality</p>
              {leanQualityNavigation.map(item => <Dialog.Close asChild key={item.href}><a href={item.href} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-primary-50">{item.label}</a></Dialog.Close>)}
            </div>
            <div aria-label="About pages" className="border-t border-slate-200 pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">About</p>
              {leanAboutNavigation.map(item => <Dialog.Close asChild key={item.href}><a href={item.href} className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-primary-50">{item.label}</a></Dialog.Close>)}
            </div>
            <div className="pt-4">
              <Dialog.Close asChild>
                <a
                  href={leanInquiryNavigation.href}
                  className="block text-center px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg shadow-md transition-all"
                >
                  {leanInquiryNavigation.label}
                </a>
              </Dialog.Close>
            </div>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <Icon name="lucide:x" className="h-6 w-6" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
