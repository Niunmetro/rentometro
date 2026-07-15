import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('SEO Files', () => {
  it('robots.txt contains User-agent and Sitemap', () => {
    const robotsPath = join(process.cwd(), 'public', 'robots.txt');
    const content = readFileSync(robotsPath, 'utf-8');

    expect(content).toContain('User-agent');
    expect(content).toContain('Sitemap');
  });

  it('sitemap.xml contains urlset and loc tags', () => {
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    const content = readFileSync(sitemapPath, 'utf-8');

    expect(content).toContain('<urlset');
    expect(content).toContain('<loc>');
  });
});
