import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const copy = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const siteUrl = copy.refine(value =>
  (/^\/(?!\/)/.test(value) || /^https:\/\/[^/\s]+/.test(value)) && !/[\\\s]/.test(value),
  'Use a site-relative path or an HTTPS URL.',
);
const image = z.object({
  src: siteUrl,
  alt: copy,
  caption: copy.optional(),
  fit: z.enum(['cover', 'contain']).optional(),
  position: z.string().regex(/^(?:\d{1,2}|100)% (?:\d{1,2}|100)%$/).optional(),
});
const link = z.object({ href: siteUrl, label: copy });
const video = z.object({
  src: siteUrl,
  poster: siteUrl.optional(),
  captions: siteUrl,
  caption: copy,
  chapters: z.array(z.object({
    time: z.number().nonnegative(),
    label: copy,
    text: copy,
  })).optional(),
});

const caseStudies = defineCollection({
  loader: glob({
    base: './',
    pattern: import.meta.env.LEANODM_LOCAL_CASE_PREVIEW === true
      ? ['src/content/case-studies/*.json', '.case-study-preview/*.json']
      : 'src/content/case-studies/*.json',
    generateId: ({ entry }) => {
      const segments = entry.split('/');
      const filename = segments.at(-1)!.replace(/\.json$/, '');
      return segments[0] === '.case-study-preview' ? `local/${filename}` : filename;
    },
  }),
  schema: z.object({
    slug,
    title: copy,
    heading: copy.optional(),
    category: copy,
    description: copy.optional(),
    summary: copy,
    cover: image,
    overview: z.object({
      paragraphs: z.array(copy).min(1),
      responsibilities: z.array(copy).min(1),
      features: z.array(copy).optional(),
      references: z.array(link.extend({ note: copy })).optional(),
    }),
    facts: z.array(z.object({ label: copy, value: copy })).optional(),
    gallery: z.array(image).optional(),
    process: z.array(z.object({
      title: copy,
      description: copy,
      image: image.optional(),
      video: video.optional(),
      links: z.array(link).optional(),
    })).optional(),
    quality: z.array(z.object({
      title: copy,
      issue: copy,
      action: copy,
      result: copy.optional(),
      evidence: copy.optional(),
      sourcingNote: copy.optional(),
      image: image.optional(),
      links: z.array(link).optional(),
    })).optional(),
    faq: z.array(z.object({ question: copy, answer: copy })).optional(),
    order: z.number().int().nonnegative().optional(),
    visibility: z.enum(['published', 'local']).default('published'),
  }).superRefine((entry, context) => {
    if (entry.visibility === 'local') return;
    const urls = [entry.cover.src, ...(entry.gallery ?? []).map(item => item.src),
      ...(entry.overview.references ?? []).map(item => item.href),
      ...(entry.process ?? []).flatMap(step => [step.image?.src, step.video?.src, step.video?.poster,
        step.video?.captions, ...(step.links ?? []).map(item => item.href)]),
      ...(entry.quality ?? []).flatMap(note => [note.image?.src, ...(note.links ?? []).map(item => item.href)]),
    ];
    if (urls.some(url => url && /\/(?:projects|case-studies)\/[^/]+\/media\//i.test(url))) {
      context.addIssue({ code: 'custom', message: 'Published cases cannot use the private case preview media endpoint.' });
    }
  }),
});

export const collections = { 'case-studies': caseStudies };
