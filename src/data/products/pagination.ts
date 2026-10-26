export const CATALOG_PAGE_SIZE = 12;

/** Only positive integer page numbers are valid; invalid values use page one. */
function validPageNumber(page: number): number {
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

/** Page one uses the base URL, without a duplicate /page/1/ route. */
export function catalogPagePath(basePath: string, page = 1): string {
  const trimmedPath = basePath.replace(/^\/+|\/+$/g, '');
  const base = trimmedPath ? `/${trimmedPath}/` : '/';
  const pageNumber = validPageNumber(page);
  return pageNumber === 1 ? base : `${base}page/${pageNumber}/`;
}

/** Empty collections have one page; out-of-range requests use the last page. */
export function paginateCatalog<T>(items: readonly T[], page = 1) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / CATALOG_PAGE_SIZE));
  const currentPage = Math.min(validPageNumber(page), totalPages);
  const offset = (currentPage - 1) * CATALOG_PAGE_SIZE;
  const pageItems = items.slice(offset, offset + CATALOG_PAGE_SIZE);

  return {
    items: pageItems,
    currentPage,
    totalPages,
    totalItems,
    offset,
    start: totalItems === 0 ? 0 : offset + 1,
    end: offset + pageItems.length,
    pageSize: CATALOG_PAGE_SIZE,
  };
}
