import { originalConcepts, ORIGINAL_CONCEPTS_PATH } from './original-concepts';
import { importedProducts } from './imported-products';

/** Shared card data for products and digital concepts. */
export interface CatalogItem {
  slug: string;
  name: string;
  path: string;
  canonical: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
}

function normalizedPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length ? `/${segments.join('/')}/` : '/';
}

/** Include direct and descendant assignments once, preserving their first source order. */
export function aggregateCategoryItems<T extends { path: string }>(
  memberships: readonly { item: T; categoryPath: string }[],
  pathname: string,
): T[] {
  const categoryPath = normalizedPath(pathname);
  const seen = new Set<string>();
  const result: T[] = [];

  for (const membership of memberships) {
    if (!normalizedPath(membership.categoryPath).startsWith(categoryPath)) continue;
    const identity = normalizedPath(membership.item.path);
    if (seen.has(identity)) continue;
    seen.add(identity);
    result.push(membership.item);
  }

  return result;
}

const catalogMemberships: readonly { item: CatalogItem; categoryPath: string }[] = [
  ...originalConcepts.map(item => ({ item, categoryPath: ORIGINAL_CONCEPTS_PATH })),
  ...importedProducts.map(item => ({ item, categoryPath: item.categoryPath })),
];

/** Keep original concepts first and imported products afterward across every parent archive. */
export function catalogItemsForPath(pathname: string): CatalogItem[] {
  return aggregateCategoryItems(catalogMemberships, pathname);
}

export const importedProductPaths = importedProducts.map(product => product.path);
