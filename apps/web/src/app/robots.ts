import type { MetadataRoute } from 'next';

const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/submission/', '/admin/', '/employees/', '/login'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'CCBot',
          'ByteDance',
          'Applebot-Extended',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/ai.json', '/.well-known/ai-plugin.json'],
        disallow: ['/submission/', '/admin/', '/employees/', '/login'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
