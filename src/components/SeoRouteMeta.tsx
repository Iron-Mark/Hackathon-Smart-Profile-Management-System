import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, SOCIAL_IMAGE_URL } from '@/lib/seo';

const INDEXABLE_ROBOTS = 'index,follow,max-image-preview:large';
const NOINDEX_ROBOTS = 'noindex,nofollow';

function upsertMetaByName(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function isPublicLandingRoute(pathname: string) {
  return pathname === '/' || pathname === '';
}

export function SeoRouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isIndexable = isPublicLandingRoute(pathname);
    const robots = isIndexable ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS;

    upsertCanonical(SITE_URL);
    upsertMetaByName('robots', robots);
    upsertMetaByName('description', SITE_DESCRIPTION);
    upsertMetaByProperty('og:title', SITE_TITLE);
    upsertMetaByProperty('og:description', SITE_DESCRIPTION);
    upsertMetaByProperty('og:url', SITE_URL);
    upsertMetaByProperty('og:image', SOCIAL_IMAGE_URL);
    upsertMetaByProperty('og:image:secure_url', SOCIAL_IMAGE_URL);
    upsertMetaByName('twitter:title', SITE_TITLE);
    upsertMetaByName('twitter:description', SITE_DESCRIPTION);
    upsertMetaByName('twitter:image', SOCIAL_IMAGE_URL);
  }, [pathname]);

  return null;
}

