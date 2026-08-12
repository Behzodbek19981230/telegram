const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiOrigin() {
  return apiOrigin;
}

export function getApiBaseUrl() {
  return apiOrigin ? `${apiOrigin}/api` : '/api';
}

export function getSocketUrl() {
  return apiOrigin || undefined;
}

export function resolveMediaUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (apiOrigin && url.startsWith('/')) return `${apiOrigin}${url}`;
  return url;
}
