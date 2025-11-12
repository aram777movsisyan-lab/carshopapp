export function parseNumber(value: string | null | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseBoolean(value: string | null | undefined) {
  if (!value) return undefined;
  return value === 'true';
}

export function buildPagination(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 50) : 10
  };
}
