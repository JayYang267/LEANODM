import eventRecords from './activity-events.json';
import mediaRecords from './activity-media.json';
import { getActivityYear, type CategoryId } from './activity-filters';

export interface ActivityMedia { id: string; kind: 'image' | 'video'; src: string; thumbnail: string; width: number; height: number; poster?: string; duration?: number; guide?: string }
export type ActivityPlacement = 'home' | 'quality' | 'ethical' | 'tooling' | 'assembly';
export interface Activity { slug: string; title: string; category: CategoryId; date: string | null; dateLabel: string; summary: string; background: string; activity: string; relevance: string; mediaIds: string[]; coverMediaId?: string; featured: boolean; placements: ActivityPlacement[]; media: ActivityMedia[]; cover: ActivityMedia; coverImageUrl: string; year: string; imageCount: number; videoCount: number }
export const activityCategories = [
  { id: 'visits', title: 'Visits & Industry Exchange', shortTitle: 'Visits & exchange', description: 'Factory visits, shared perspectives and conversations across industry.', icon: '↗' },
  { id: 'community', title: 'Community & Education', shortTitle: 'Community & education', description: 'Connections with schools, students and the wider community.', icon: '◎' },
  { id: 'team', title: 'Team & Employee Care', shortTitle: 'Team & employee care', description: 'The people, shared occasions and everyday care within Xinyinhai’s factory team.', icon: '◇' },
  { id: 'improvement', title: 'Continuous Improvement', shortTitle: 'Continuous improvement', description: 'Workplace learning, workshop observations and practical improvements.', icon: '↻' },
] as const;
const mediaById = new Map((mediaRecords as ActivityMedia[]).map(item => [item.id, item]));
// Retain archive/source mappings while excluding withdrawn records from every public placement.
export const activities: Activity[] = eventRecords.filter(record => record.published !== false).map(record => {
  const resolved = record.mediaIds.map(id => { const item = mediaById.get(id); if (!item) throw new Error(`Activity ${record.slug} has unresolved media ${id}`); return item; });
  const media = resolved.filter((item, index) => resolved.findIndex(other => other.src === item.src) === index);
  if (!media.length) throw new Error(`Activity ${record.slug} has no media`);
  const selectedCoverId = (record as { coverMediaId?: string }).coverMediaId;
  const cover = media.find(item => item.id === selectedCoverId) ?? media.find(item => item.kind === 'image') ?? media[0];
  return { ...record, category: record.category as CategoryId, placements: record.placements as ActivityPlacement[], media, cover, coverImageUrl: cover.kind === 'video' ? cover.poster ?? cover.thumbnail : cover.src, year: getActivityYear(record), imageCount: media.filter(item => item.kind === 'image').length, videoCount: media.filter(item => item.kind === 'video').length };
}).sort((a, b) => {
  // Label-only dates retain their real precision; unknown dates remain explicitly unknown.
  const key = (item: Activity) => item.date ?? (item.year === 'unknown' ? '' : item.year);
  return key(b).localeCompare(key(a)) || a.title.localeCompare(b.title);
});
export const activityNavigation = [{ label: 'Overview', href: '#overview' }, { label: 'Browse activities', href: '/about/activities/#archive' }, { label: 'Archive context', href: '/about/activities/#our-approach' }];
export function getActivitiesForPlacement(placement: ActivityPlacement): Activity[] {
  const selected = activities.filter(item => item.placements.includes(placement)).sort((a, b) => Number(b.featured) - Number(a.featured));
  if (placement === 'home') return activityCategories.map(category => selected.find(item => item.category === category.id)).filter((item): item is Activity => !!item);
  return selected.slice(0, 3);
}
export function getRelatedActivities(activity: Activity): Activity[] {
  return activities.filter(item => item.slug !== activity.slug).sort((a, b) => Number(b.category === activity.category) - Number(a.category === activity.category) || Number(b.featured) - Number(a.featured)).slice(0, 3);
}
export const activityContextLinks: Record<ActivityPlacement, { label: string; href: string; description: string }> = {
  home: { label: 'Discover LEANODM.com', href: '/', description: 'Xinyinhai’s manufacturing and product-development scope' },
  quality: { label: 'Quality System', href: '/quality/', description: 'How documented quality controls connect to manufacturing' },
  ethical: { label: 'Ethical Manufacturing', href: '/about/ethical-manufacturing/', description: 'Labor, workplace safety and management procedures' },
  tooling: { label: 'Tooling & Injection Molding', href: '/manufacturing/tooling-injection-molding/', description: 'From tool development to injection-molded parts' },
  assembly: { label: 'Assembly & Packaging', href: '/manufacturing/assembly-packaging/', description: 'Assembly, checks and final packaging' },
};
