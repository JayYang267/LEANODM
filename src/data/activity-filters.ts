export const categoryIds = ['visits', 'community', 'team', 'improvement'] as const;
export type CategoryId = typeof categoryIds[number];
export interface ArchiveState { category: CategoryId | 'all'; year: string; query: string; page: number }
export interface SearchableActivity { slug: string; title: string; category: string; date: string | null; dateLabel: string; summary: string }
export const PAGE_SIZE = 12;

export function getActivityYear(item: Pick<SearchableActivity, 'date' | 'dateLabel'>): string {
  return item.date?.match(/^(\d{4})-/)?.[1] ?? item.dateLabel.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? 'unknown';
}
export function readArchiveState(search: string): ArchiveState {
  const params = new URLSearchParams(search);
  const category = params.get('category') ?? 'all';
  const year = params.get('year') ?? 'all';
  const page = Number(params.get('page') ?? 1);
  return { category: categoryIds.includes(category as CategoryId) ? category as CategoryId : 'all', year: /^(?:19|20)\d{2}$/.test(year) || year === 'unknown' ? year : 'all', query: (params.get('q') ?? '').trim().slice(0, 200), page: Number.isSafeInteger(page) && page > 0 ? page : 1 };
}
export function updateArchiveState(state: ArchiveState, changes: Partial<ArchiveState>): ArchiveState {
  const filtering = changes.category !== undefined || changes.year !== undefined || changes.query !== undefined;
  return { ...state, ...changes, page: filtering ? 1 : changes.page ?? state.page };
}
export function writeArchiveState(state: ArchiveState, existing = ''): string {
  const params = new URLSearchParams(existing);
  for (const [key, value] of Object.entries({ category: state.category === 'all' ? '' : state.category, year: state.year === 'all' ? '' : state.year, q: state.query, page: state.page === 1 ? '' : String(state.page) })) {
    if (value) params.set(key, value); else params.delete(key);
  }
  return params.toString();
}
export function selectActivities<T extends SearchableActivity>(records: readonly T[], state: ArchiveState, pageSize = PAGE_SIZE) {
  const query = state.query.trim().toLocaleLowerCase('en');
  const matching = records.filter(item => (state.category === 'all' || item.category === state.category) && (state.year === 'all' || getActivityYear(item) === state.year) && (!query || `${item.title} ${item.summary} ${item.dateLabel} ${item.category}`.toLocaleLowerCase('en').includes(query)));
  const total = matching.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pages, Math.max(1, state.page));
  return { total, pages, page, items: matching.slice((page - 1) * pageSize, page * pageSize) };
}
