const FALLBACK = 'Não foi possível falar com a API';

export function problemDetail(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return FALLBACK;
  }
  const data = 'data' in error ? (error as { data: unknown }).data : error;
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === 'string' && detail.length > 0) {
      return detail;
    }
  }
  return FALLBACK;
}
