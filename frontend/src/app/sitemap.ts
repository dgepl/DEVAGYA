import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://devgya.in';
  const routes = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/faq',
    '/why-choose-us',
    '/ai-platform',
    '/safety-standards',
    '/privacy-policy',
    '/terms-of-service',
    '/login',
    '/register',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
