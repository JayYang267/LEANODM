import { ORIGINAL_CONCEPTS_PATH, conceptCollection } from './original-concepts';
import { catalogItemsForPath } from './catalog-items';

export interface ProductCategory {
  slug: string;
  label: string;
  description: string;
  children?: ProductCategory[];
}

// Category names and nesting verified against shengyip.com/products on 2026-10-23.
// Root display names updated to Toys / Consumer electronics by the user on 2026-10-26.
// Existing branches retain their navigation structure. The original-concepts
// branch was added by the user's 2026-10-24 request; it contains digital ideas,
// not physically validated products or reference-brand listings.
export const productCategories: ProductCategory[] = [
  {
    slug: 'plastic-electronic-toys',
    label: 'Toys',
    description: 'Explore sound books, learning sound toys, mother and baby electronic products, sound modules, promotional sound gifts and original product concepts by category.',
    children: [
      {
        slug: 'sound-books', label: 'Sound Books',
        description: 'Browse sound book categories by interaction: press buttons, touch, interactive features, innovative formats, and lights and sounds.',
        children: [
          { slug: 'press-button-sound-books', label: 'Press Button Sound Books', description: 'Sound books organized around press-button audio interaction.' },
          { slug: 'touch-it-sound-books', label: 'Touch-it Sound Books', description: 'Sound books organized around touch interaction.' },
          { slug: 'interactive-sound-books', label: 'Interactive Sound Books', description: 'Sound books organized around interactive audio activities.' },
          { slug: 'innovative-sound-books', label: 'Innovative Sound Books', description: 'Sound books grouped by alternative formats and interaction ideas.' },
          { slug: 'lights-sounds-books', label: 'Lights & Sounds Books', description: 'Sound book formats that combine lighting and audio interaction.' },
        ],
      },
      {
        slug: 'learning-educational-intelligent-sound-toys', label: 'Learning(Educational/lntelligent)Sound Toys',
        description: 'Browse learning sound toys by format: tablets, talking flash cards, interactive toys, multi-function toys and reading pens.',
        children: [
          { slug: 'sound-tablet-toys', label: 'Sound Tablet Toys', description: 'Learning sound toys in a tablet-style format.' },
          { slug: 'talking-flash-cards', label: 'Talking Flash Cards', description: 'Flash card formats that pair printed content with spoken audio.' },
          { slug: 'interactive-sound-toys', label: 'Interactive Sound Toys', description: 'Sound toys organized around interactive play.' },
          { slug: 'multi-function-sound-toys', label: 'Multi-function Sound Toys', description: 'Sound toy formats with multiple play or learning functions.' },
          { slug: 'educational-reading-pens', label: 'Educational Reading Pens', description: 'Reading pen formats for audio-assisted interaction with learning content.' },
        ],
      },
      {
        slug: 'mother-baby-electronic-products', label: 'Mother & Baby Electronic Products',
        description: 'Browse the mother and baby electronic product category and its sensory toy subgroup.',
        children: [
          { slug: 'baby-teether-sensory-toys', label: 'Baby Teether Sensory Toys', description: 'The category for baby teether and sensory toy formats.' },
        ],
      },
      {
        slug: 'sound-modules', label: 'Sound Modules',
        description: 'Browse sound module categories for light and audio features, prank sound toys, and sound boxes for plush toys.',
        children: [
          { slug: 'led-sound-modules', label: 'LED & Sound Modules', description: 'Module formats that combine LED lighting and sound.' },
          { slug: 'prank-sound-toys', label: 'Prank Sound Toys', description: 'Sound toy formats organized around playful audio effects.' },
          { slug: 'sound-boxes-for-plush-toys', label: 'Sound Boxes for Plush Toys', description: 'Sound box formats intended for integration into plush toys.' },
        ],
      },
      {
        slug: 'promotional-sound-gifts', label: 'Promotional Sound Gifts',
        description: 'Browse promotional sound gift categories, including music keychains and recordable boxes.',
        children: [
          { slug: 'music-keychains', label: 'Music Keychains', description: 'Keychain formats with music or audio features.' },
          { slug: 'recordable-boxes', label: 'Recordable Boxes', description: 'Box formats with a recordable audio feature.' },
        ],
      },
      {
        slug: 'original-product-concepts',
        label: conceptCollection.name,
        description: conceptCollection.description,
      },
    ],
  },
  {
    slug: 'plastic-electronic-products', label: 'Consumer electronics',
    description: 'Explore the consumer electronics category. For a project discussion, share the intended function, reference sample or specification, target market and estimated quantity.',
  },
];

export interface CatalogEntry {
  path: string;
  category: ProductCategory;
  ancestors: ProductCategory[];
}

function flatten(categories: ProductCategory[], ancestors: ProductCategory[] = []): CatalogEntry[] {
  return categories.flatMap(category => {
    const path = `/products/${[...ancestors, category].map(item => item.slug).join('/')}/`;
    return [{ path, category, ancestors }, ...flatten(category.children ?? [], [...ancestors, category])];
  });
}

export const catalogEntries = flatten(productCategories);
export const catalogPath = (category: ProductCategory) => catalogEntries.find(entry => entry.category === category)!.path;
// Root hubs and populated category archives are indexable. Empty subcategories
// remain followable but out of the index and sitemap until content is added.
export const catalogIndexPaths = [...new Set([
  '/products/',
  ...catalogEntries.filter(entry => entry.ancestors.length === 0 || catalogItemsForPath(entry.path).length > 0).map(entry => entry.path),
  ORIGINAL_CONCEPTS_PATH,
])];
