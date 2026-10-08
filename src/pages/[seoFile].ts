import type { APIRoute } from 'astro';
import { getSiteUrl } from '../lib/site';

export function getStaticPaths() {
  return ['robots.txt', ...(getSiteUrl() ? ['sitemap.xml'] : [])].map(seoFile => ({ params: { seoFile } }));
}
const escapeXml = (value: string) => value.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);

export const GET: APIRoute = ({ params }) => {
  const site = getSiteUrl();
  if (params.seoFile === 'robots.txt') {
    return new Response(`User-agent: *\nAllow: /\n${site ? `\nSitemap: ${new URL('/sitemap.xml', site).href}\n` : ''}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  if (!site) return new Response(null, { status: 404 });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(site.href)}</loc></url><url><loc>${escapeXml(new URL('/en/', site).href)}</loc></url></urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
