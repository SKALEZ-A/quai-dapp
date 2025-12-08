import { MetadataRoute } from 'next'
 
const baseUrl = 'https://synqdapp.com'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '/',
    'dashboard/',
    '/qns/profile', 
    '/dashboard/bridge', 
    '/dashboard/social', 
    '/privacy', 
    '/terms', 
    '/security'
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7, 
  }))
}