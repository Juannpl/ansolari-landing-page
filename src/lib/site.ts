export function getSiteUrl(): URL | undefined {
  const value = import.meta.env.PUBLIC_SITE_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_URL doit être une origine HTTP(S), sans identifiants, chemin, paramètres ou fragment.');
  }
  return url;
}
