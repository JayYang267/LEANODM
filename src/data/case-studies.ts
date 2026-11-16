import { getCollection, type CollectionEntry } from 'astro:content';

export type CaseStudy = CollectionEntry<'case-studies'>;
export type CaseImage = CaseStudy['data']['cover'];
export const caseStudiesPath = '/case-studies/';
export const caseStudyPath = (slug: string) => `${caseStudiesPath}${slug}/`;

export async function getCaseStudies({ includeLocal = false } = {}) {
  const all = await getCollection('case-studies');
  for (const entry of all) {
    const local = entry.data.visibility === 'local';
    if (entry.id !== (local ? `local/${entry.data.slug}` : entry.data.slug)) {
      throw new Error(`Case study "${entry.id}" must match slug "${entry.data.slug}" and be in the corresponding public or local content directory.`);
    }
  }
  const publicSlugs = new Set(all.filter(({ data }) => data.visibility === 'published').map(({ data }) => data.slug));
  return all.filter(({ data }) => data.visibility === 'published' || (includeLocal && !publicSlugs.has(data.slug)))
    .sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity)
      || a.data.title.localeCompare(b.data.title, 'en') || a.id.localeCompare(b.id, 'en'));
}

export function caseImageStyle({ fit = 'cover', position = '50% 50%' }: CaseImage) {
  return `object-fit:${fit};object-position:${position}`;
}
